import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ReminderRow {
  id: string;
  pet_id: string;
  title: string;
  remind_at: string;
  repeat_interval: string | null;
  pets: { user_id: string; name: string };
}

interface PushTokenRow {
  token: string;
}

Deno.serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch due reminders (active, due now or past, not yet notified for this cycle)
    const { data: reminders, error: fetchError } = await supabase
      .from('reminders')
      .select('id, pet_id, title, remind_at, repeat_interval, pets(user_id, name)')
      .eq('is_active', true)
      .lte('remind_at', new Date().toISOString())
      .or('last_notified_at.is.null,last_notified_at.lt.remind_at')
      .limit(100);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No due reminders' }), { status: 200 });
    }

    let sentCount = 0;

    for (const reminder of reminders as unknown as ReminderRow[]) {
      const userId = reminder.pets?.user_id;
      if (!userId) continue;

      // 2. Get push tokens for this user
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', userId);

      if (!tokens || tokens.length === 0) continue;

      // 3. Send push notification via Expo Push API
      const messages = (tokens as PushTokenRow[]).map((t) => ({
        to: t.token,
        title: '🐾 PawTrack Reminder',
        body: reminder.title,
        sound: 'default',
        data: { reminderId: reminder.id, petId: reminder.pet_id },
      }));

      try {
        const pushRes = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });

        if (pushRes.ok) {
          sentCount += messages.length;
        } else {
          console.error('Push API error:', await pushRes.text());
        }
      } catch (pushErr) {
        console.error('Push send failed:', pushErr);
      }

      // 4. Update last_notified_at
      await supabase
        .from('reminders')
        .update({ last_notified_at: new Date().toISOString() })
        .eq('id', reminder.id);

      // 5. Handle repeating reminders
      if (reminder.repeat_interval) {
        // Calculate next remind_at by adding the interval via SQL
        const { error: repeatError } = await supabase.rpc('advance_reminder', {
          reminder_id: reminder.id,
          interval_value: reminder.repeat_interval,
        });

        if (repeatError) {
          console.error('Repeat advance failed:', repeatError);
        }
      }
    }

    return new Response(
      JSON.stringify({ sent: sentCount, processed: reminders.length }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Unhandled error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

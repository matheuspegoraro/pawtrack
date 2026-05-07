-- =============================================
-- Function to advance a repeating reminder
-- Called by the Edge Function after sending a notification
-- =============================================
create or replace function public.advance_reminder(
  reminder_id uuid,
  interval_value text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.reminders
  set remind_at = remind_at + interval_value::interval
  where id = reminder_id;
end;
$$;

-- =============================================
-- Enable pg_cron for scheduled jobs
-- (pg_cron is available on Supabase Pro plans)
-- =============================================
-- Note: pg_cron and pg_net must be enabled via the Supabase Dashboard
-- under Database > Extensions. The cron job below schedules the
-- Edge Function to run every 15 minutes.
--
-- After enabling extensions, run this in the SQL Editor:
--
-- select cron.schedule(
--   'send-reminders',
--   '*/15 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://myuxzntejlkbqctguxhl.supabase.co/functions/v1/send-reminders',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

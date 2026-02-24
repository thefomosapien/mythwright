-- ============================================================================
-- Follower Count Trigger
-- Automatically updates universes.follower_count on follow/unfollow
-- ============================================================================

create or replace function public.update_follower_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.universes
    set follower_count = follower_count + 1
    where id = new.universe_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.universes
    set follower_count = follower_count - 1
    where id = old.universe_id;
    return old;
  end if;
end;
$$;

create trigger on_follow_change
  after insert or delete on public.universe_follows
  for each row execute function public.update_follower_count();

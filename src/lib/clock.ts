import {useEffect} from 'react';
import {AppState} from 'react-native';
import dayjs from 'dayjs';

import {useStore} from '@/store';

/** setTimeout's ceiling (~24.8 days); anything longer overflows to 0. */
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Keeps the store's `today` in step with the real calendar.
 *
 * The streak count and "held today" are derived from `today`, so without this
 * an app left open — or, far more often, resumed from the background the next
 * morning — keeps showing yesterday: the companion still awake and the new
 * day's hold refused. Two triggers cover it:
 *   - a timer that fires just after each local midnight
 *   - the app returning to the foreground (on web, RN Web drives AppState from
 *     the page's visibility), which also catches timers the OS suspended
 *
 * Mount once, near the root.
 */
export function useDayClock(): void {
  const syncToday = useStore(s => s.syncToday);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleNext = () => {
      syncToday();
      const now = dayjs();
      const untilMidnight = now.add(1, 'day').startOf('day').diff(now) + 1000;
      timer = setTimeout(scheduleNext, Math.min(untilMidnight, MAX_TIMEOUT));
    };
    scheduleNext();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        // re-arm too: a suspended timer may now be hours late
        if (timer) clearTimeout(timer);
        scheduleNext();
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, [syncToday]);
}

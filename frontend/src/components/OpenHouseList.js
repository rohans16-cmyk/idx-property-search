import {
  formatOpenHouseDate,
  formatOpenHouseTime,
} from "../utils/format";
import { getOpenHouseRemarks } from "../utils/openHouses";

export default function OpenHouseList({ openHouses }) {
  const events = Array.isArray(openHouses) ? openHouses : [];

  if (events.length === 0) {
    return (
      <section className="open-houses">
        <h2>Open houses</h2>
        <p className="open-houses__empty">No open houses scheduled</p>
      </section>
    );
  }

  return (
    <section className="open-houses">
      <h2>Open houses</h2>
      <ul className="open-houses__list">
        {events.map((event) => {
          const remarks = getOpenHouseRemarks(event.all_data);
          return (
            <li
              key={event.id || `${event.OpenHouseDate}-${event.OH_StartTime}`}
              className="open-houses__item"
            >
              <p className="open-houses__date">
                {formatOpenHouseDate(event.OpenHouseDate)}
              </p>
              <p className="open-houses__time">
                {formatOpenHouseTime(event.OH_StartTime)} –{" "}
                {formatOpenHouseTime(event.OH_EndTime)}
              </p>
              {remarks && <p className="open-houses__remarks">{remarks}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

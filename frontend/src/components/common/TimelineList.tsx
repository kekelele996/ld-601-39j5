export type TimelineEntry = {
  key: string | number;
  title: string;
  time?: string;
  desc?: string;
  status?: string;
};

export function TimelineList({
  title = "TimelineList",
  value = "READY",
  entries
}: {
  title?: string;
  value?: string;
  entries?: TimelineEntry[];
}) {
  if (!entries || entries.length === 0) {
    return (
      <div className="shared-widget">
        <strong>{title}</strong>
        <span className="timeline-fallback">{value}</span>
      </div>
    );
  }
  return (
    <div className="shared-widget timeline">
      <strong>{title}</strong>
      <ol>
        {entries.map((entry) => (
          <li key={entry.key}>
            <div className="timeline-head">
              <span className="timeline-title">{entry.title}</span>
              {entry.status && <span className="timeline-status">{entry.status}</span>}
            </div>
            {entry.time && <time>{entry.time}</time>}
            {entry.desc && <p>{entry.desc}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

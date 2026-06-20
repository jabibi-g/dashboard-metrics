interface DatasetSelectorProps {
  datasets: string[];
  active: string;
  onChange: (ds: string) => void;
}

export function DatasetSelector({ datasets, active, onChange }: DatasetSelectorProps) {
  return (
    <div className="dataset-selector" role="tablist" aria-label="Seleccionar dataset">
      {datasets.map((ds) => (
        <button
          key={ds}
          role="tab"
          aria-selected={ds === active}
          className={`dataset-btn ${ds === active ? 'active' : ''}`}
          onClick={() => onChange(ds)}
        >
          {ds}
        </button>
      ))}
    </div>
  );
}

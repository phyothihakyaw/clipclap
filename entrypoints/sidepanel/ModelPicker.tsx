import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchModels,
  filterModels,
  modelPriceLabel,
  type OpenRouterModel,
} from "../../lib/models";

interface ModelPickerProps {
  apiKey: string;
  selectedModelId: string;
  onSelect: (modelId: string) => void;
}

export function ModelPicker({
  apiKey,
  selectedModelId,
  onSelect,
}: ModelPickerProps) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? null,
    [models, selectedModelId],
  );

  const filtered = useMemo(() => filterModels(models, query).slice(0, 80), [
    models,
    query,
  ]);

  async function loadModels(force = false) {
    if (!apiKey.trim()) {
      setModels([]);
      setError("Add an API key to load models.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await fetchModels(apiKey, { force });
      setModels(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadModels(false);
  }, [apiKey]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="field" ref={rootRef}>
      <div className="field-label-row">
        <label htmlFor="model-search">Model</label>
        <button
          type="button"
          className="linkish"
          onClick={() => void loadModels(true)}
          disabled={loading || !apiKey.trim()}
        >
          Refresh
        </button>
      </div>
      <button
        type="button"
        className="model-trigger"
        onClick={() => setOpen((value) => !value)}
        disabled={!apiKey.trim()}
      >
        <span className="model-trigger-main">
          {selected ? selected.name : selectedModelId || "Choose a model"}
        </span>
        <span className="model-trigger-sub">
          {selected
            ? `${selected.id} · ${modelPriceLabel(selected)}`
            : selectedModelId || "Required for rewrite"}
        </span>
      </button>
      {open && (
        <div className="model-popover">
          <input
            id="model-search"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, provider, or slug"
            autoFocus
          />
          <div className="model-list">
            {loading && <div className="muted pad">Loading models…</div>}
            {!loading && error && <div className="error pad">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="muted pad">No models match.</div>
            )}
            {!loading &&
              !error &&
              filtered.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={
                    model.id === selectedModelId
                      ? "model-row selected"
                      : "model-row"
                  }
                  onClick={() => {
                    onSelect(model.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="model-row-name">{model.name}</span>
                  <span className="model-row-slug">{model.id}</span>
                  <span className="model-row-price">
                    {modelPriceLabel(model)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

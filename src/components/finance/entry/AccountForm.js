import React, { useId, useState } from "react";

// Create/edit form for a single account. Owner and type are free-text inputs with
// datalist suggestions from config — new strings are auto-added to config by actions.js.
// Currency is deliberately not editable (GBP-assumed; display-only in v1).

const inputClass =
  "h-10 w-full rounded-lg border-b-[1px] border-b-gray-600 bg-[#191b1e] text-lightText px-3 outline-none focus-visible:outline-designColor focus-visible:border-b-transparent duration-300";
const labelClass = "block text-sm font-titleFont text-lightText mb-2";

function AccountForm({ initial, config, defaultColour, onSubmit, onCancel }) {
  const uid = useId();
  const [fields, setFields] = useState({
    name: initial?.name ?? "",
    provider: initial?.provider ?? "",
    owner: initial?.owner ?? config.owners[0] ?? "",
    type: initial?.type ?? "",
    colour: initial?.colour ?? defaultColour ?? "#5d7bff",
    notes: initial?.notes ?? "",
  });
  const [error, setError] = useState(null);

  const set = (key) => (event) =>
    setFields((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = {
      name: fields.name.trim(),
      provider: fields.provider.trim(),
      owner: fields.owner.trim(),
      type: fields.type.trim(),
      colour: fields.colour,
      notes: fields.notes.trim(),
    };
    if (!trimmed.name || !trimmed.owner || !trimmed.type) {
      setError("Name, owner and type are required.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black bg-opacity-25 border border-gray-600 rounded-lg shadow-shadowOne p-6 flex flex-col gap-4"
    >
      <h3 className="text-lg font-titleFont font-bold text-lightText">
        {initial ? "Edit account" : "New account"}
      </h3>
      <div className="grid grid-cols-1 sml:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor={`name-${uid}`}>
            Name *
          </label>
          <input
            id={`name-${uid}`}
            className={inputClass}
            autoComplete="off"
            autoFocus
            value={fields.name}
            onChange={set("name")}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`provider-${uid}`}>
            Provider
          </label>
          <input
            id={`provider-${uid}`}
            className={inputClass}
            autoComplete="off"
            placeholder="e.g. Vanguard"
            value={fields.provider}
            onChange={set("provider")}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`owner-${uid}`}>
            Owner *
          </label>
          <input
            id={`owner-${uid}`}
            className={inputClass}
            autoComplete="off"
            list={`owners-${uid}`}
            value={fields.owner}
            onChange={set("owner")}
          />
          <datalist id={`owners-${uid}`}>
            {config.owners.map((owner) => (
              <option key={owner} value={owner} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass} htmlFor={`type-${uid}`}>
            Type *
          </label>
          <input
            id={`type-${uid}`}
            className={inputClass}
            autoComplete="off"
            list={`types-${uid}`}
            placeholder="Pick or type a new one"
            value={fields.type}
            onChange={set("type")}
          />
          <datalist id={`types-${uid}`}>
            {config.accountTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass} htmlFor={`colour-${uid}`}>
            Colour
          </label>
          <input
            id={`colour-${uid}`}
            type="color"
            className="h-10 w-full rounded-lg border border-gray-600 bg-[#191b1e] px-1 cursor-pointer"
            value={fields.colour}
            onChange={set("colour")}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`notes-${uid}`}>
            Notes
          </label>
          <input
            id={`notes-${uid}`}
            className={inputClass}
            autoComplete="off"
            value={fields.notes}
            onChange={set("notes")}
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm font-bodyFont">{error}</p>}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-600 text-lightText font-titleFont hover:border-designColor hover:text-designColor transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-designColor text-bodyColor font-titleFont hover:opacity-80 transition-opacity duration-300"
        >
          {initial ? "Save changes" : "Create account"}
        </button>
      </div>
    </form>
  );
}

export default AccountForm;

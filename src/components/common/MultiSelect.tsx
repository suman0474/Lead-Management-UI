import React from "react";
import Select from "react-select";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

const MultiSelect = ({ label, options, selected, onChange, placeholder = 'Select...' }: Props) => {
  const selectOptions: Option[] = options.map((val) => ({
    value: val,
    label: val,
  }));

  const selectedOptions = selectOptions.filter((opt) =>
    selected.includes(opt.value)
  );

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <Select
        isMulti
        options={selectOptions}
        value={selectedOptions}
        onChange={(selected) => onChange(selected.map((s) => s.value))}
        placeholder={placeholder}
      />
    </div>
  );
};

export default MultiSelect;

import React from "react";
import Input from "../../../components/Input";

interface MoscowAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MoscowAddressInput: React.FC<MoscowAddressInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-[40px] -translate-y-1/2 text-white font-primary text-[12px]">
        Москва,
      </div>
      <Input
        name="address"
        label="Адрес*"
        value={value}
        onChange={handleChange}
        placeholder="ул. ..., д. ..."
        className="pl-[72px]"
        autoComplete=""
      />
      {error && (
        <p className="text-red-500 font-primary font-thin text-[10px]">
          {error}
        </p>
      )}
    </div>
  );
};

export default MoscowAddressInput;

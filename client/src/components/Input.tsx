interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  type?: string;
}

export default function Input({ name, label, type = "text", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 font-primary">
      <label htmlFor={name} className="text-[10px] text-gray-400">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          className="w-full px-4 py-2 min-h-[100px] bg-[#161616] rounded-2xl text-[12px] text-white focus:bg-[#222222] focus:outline-none border-none resize-none"
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          {...props}
          id={name}
          className={`w-full px-4 py-2 bg-[#161616] rounded-2xl text-[12px] text-white focus:bg-[#222222] focus:outline-none border-none ${props.className}`}
        />
      )}
    </div>
  );
}
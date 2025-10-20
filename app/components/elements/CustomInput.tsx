import {useRef} from 'react';

export function CustomInput({
  label,
  isRequire = false,
  showValidMessage = true,
  invalidMessage = '',
  value = '',
  setValue,
  check,
  validate,
  setFormCheck,
  isFormSent,
  type = 'input',
  className,
}: {
  label?: string;
  isRequire?: boolean;
  showValidMessage?: boolean;
  invalidMessage?: string;
  value: string;
  setValue: any;
  check: boolean;
  validate?: any;
  setFormCheck: any;
  isFormSent?: boolean;
  type?: 'textarea' | 'input';
  className?: string;
}) {
  const forceCheck = useRef(false);
  if (check) {
    forceCheck.current = check;
  }
  if (isFormSent) {
    forceCheck.current = !isFormSent;
  }
  const isValid = forceCheck ? validate(value) : true;

  return type === 'input' ? (
    <div className="w-full">
      <div className="relative">
        <input
          className={`${className} ${getInputStyleClasses(
            forceCheck.current ? isValid : true,
          )}`}
          placeholder=" "
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            forceCheck.current = false;
            setFormCheck(false);
          }}
          autoComplete="off"
          spellCheck="false"
        />
        <label className="text-sm form-label">
          {label} {isRequire && <span className="text-red-500">*</span>}
        </label>
      </div>
      {isValid || !forceCheck.current || !showValidMessage ? (
        ''
      ) : (
        <p className={`text-red-500 relative top-0 text-xs `}>
          {invalidMessage} &nbsp;
        </p>
      )}
    </div>
  ) : (
    <div className="w-full">
      <div className="relative">
        <textarea
          className={`${className} ${getInputStyleClasses(
            forceCheck.current ? isValid : true,
          )} h-40 resize-none`}
          placeholder=" "
          value={value}
          maxLength="2000"
          onChange={(e) => {
            setValue(e.target.value);
            forceCheck.current = false;
            setFormCheck(false);
          }}
          spellCheck="false"
        />
        <label className="text-sm form-label">
          {label} {isRequire && <span className="text-red-500">*</span>}
        </label>
      </div>
      {isValid || !forceCheck.current ? (
        ''
      ) : (
        <p className={`text-red-500 relative top-0 text-xs`}>
          {invalidMessage} &nbsp;
        </p>
      )}
    </div>
  );
}

export const INPUT_STYLE_CLASSES =
  'form-input mb-1 text-sm pt-4 pb-3 appearance-none rounded border focus:border-black/50 focus:ring-0 w-full py-2 px-3 text-black placeholder:text-black/50 leading-tight focus:shadow-outline';

export const getInputStyleClasses = (valid?: boolean) => {
  return `${INPUT_STYLE_CLASSES} ${
    valid ? 'border-black/20' : 'border-red-500'
  }`;
};

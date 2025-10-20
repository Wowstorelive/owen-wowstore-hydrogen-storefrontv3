export const DotButton = ({
  selected,
  onClick,
}: {
  selected: any;
  onClick: any;
}) => (
  <button
    className={`embla__dot ${selected ? 'is-selected' : ''}`}
    type="button"
    onClick={onClick}
  />
);

export const PrevButton = ({
  enabled,
  onClick,
  buttonColor = 'white',
  centerImage = false,
}: {
  enabled: any;
  onClick: any;
  buttonColor?: string;
  centerImage?: boolean;
}) => (
  <button
    className={
      (enabled ? 'opacity-100' : 'opacity-50') +
      (buttonColor == 'white' ? ' text-white' : ' text-black') +
      (centerImage == true
        ? ' top-1/3 translate-y-2/3'
        : ' top-1/2 -translate-y-1/2') +
      ' prev absolute z-10 left-6'
    }
    onClick={onClick}
    disabled={!enabled}
    title="Prev"
  >
    <svg
      width="24"
      height="44"
      viewBox="0 0 22 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_252_465)">
        <path
          d="M0.981771 19.9999C0.981771 19.5818 1.14498 19.1634 1.47096 18.8442L18.1674 2.49809C18.8198 1.85936 19.8763 1.85936 20.5283 2.49809C21.1803 3.1368 21.1807 4.17111 20.5283 4.80945L5.01227 19.9999L20.5283 35.1905C21.1807 35.8292 21.1807 36.8634 20.5283 37.5018C19.8759 38.14 18.8194 38.1406 18.1674 37.5018L1.47096 21.1556C1.14498 20.8364 0.981771 20.418 0.981771 19.9999Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_252_465">
          <rect
            width="40"
            height="22"
            fill="white"
            transform="translate(22) rotate(90)"
          />
        </clipPath>
      </defs>
    </svg>
  </button>
);

export const NextButton = ({
  enabled,
  onClick,
  buttonColor = 'white',
  centerImage = false,
}: {
  enabled: any;
  onClick: any;
  buttonColor?: string;
  centerImage?: boolean;
}) => (
  <button
    className={
      (enabled ? 'opacity-100' : 'opacity-50') +
      (buttonColor == 'white' ? ' text-white' : ' text-black') +
      (centerImage == true
        ? ' top-1/3 translate-y-2/3'
        : ' top-1/2 -translate-y-1/2') +
      ' next absolute z-10 right-6'
    }
    onClick={onClick}
    disabled={!enabled}
    title="Next"
  >
    <svg
      width="24"
      height="44"
      viewBox="0 0 22 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_252_465)">
        <path
          d="M21.0182 20.0001C21.0182 20.4182 20.855 20.8366 20.529 21.1558L3.83262 37.5019C3.18019 38.1406 2.12373 38.1406 1.47173 37.5019C0.819734 36.8632 0.819319 35.8289 1.47173 35.1906L16.9877 20.0001L1.47173 4.80954C0.819319 4.17077 0.819319 3.13662 1.47173 2.49815C2.12414 1.86 3.1806 1.85938 3.83262 2.49815L20.529 18.8444C20.855 19.1636 21.0182 19.582 21.0182 20.0001Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_252_465">
          <rect
            width="40"
            height="22"
            fill="white"
            transform="translate(0 40) rotate(-90)"
          />
        </clipPath>
      </defs>
    </svg>
  </button>
);

import {GoStarIcon} from '~/components/elements/Icon';

export function Rating({
  rating = 0,
  setRating,
  className,
}: {
  rating?: number;
  setRating?: any;
  className?: string;
}) {
  const ratingE = [];
  for (let i = 0; i < 5; i++) {
    ratingE.push(
      <div
        key={i}
        onClick={() => {
          if (setRating) {
            setRating(i + 1);
          }
        }}
        className={`${setRating ? 'cursor-pointer' : ''} ${className}`}
        aria-hidden="true"
      >
        {i < rating ? (
          <GoStarIcon color="orange" />
        ) : (
          <GoStarIcon color="#bbbbbb" />
        )}
      </div>,
    );
  }
  return <div className="flex items-center gap-0.5">{ratingE}</div>;
}

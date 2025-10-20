import {Link} from '~/components/elements/Link';
import {IconClose} from '~/components/elements/Icon';

export function Modal({
  children,
  cancelLink,
}: {
  children: React.ReactNode;
  cancelLink: string;
}) {
  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      id="modal-bg"
    >
      <div className="fixed inset-0 transition-opacity bg-opacity-75 bg-primary/40"></div>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
          <div
            className="relative flex-1 px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform rounded shadow-xl bg-white sm:my-12 sm:flex-none sm:w-full sm:max-w-2xl sm:p-6"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            tabIndex={0}
            aria-hidden="true"
          >
            <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 pt-4 px-4">
              <Link
                to={cancelLink}
                className="block p-4 -m-4 transition text-black"
              >
                <IconClose aria-label="Close panel" />
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

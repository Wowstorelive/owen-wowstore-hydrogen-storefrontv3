import {Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {IconClose} from '~/components/elements/Icon';

export function CustomModal({
    isOpen,
    onClose,
    settings,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    settings?: any;
    children: any;
  }) {

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose} aria-label="Modal Popup">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-3xl transform overflow-hidden rounded bg-white text-left align-middle shadow-xl transition-all"
                style={{
                  backgroundColor: settings?.background,
                  color: settings?.color,
                }}
              >
                <button
                  type="button"
                  className="absolute top-2 right-2"
                  onClick={onClose}
                >
                  <IconClose aria-label="Close panel" />
                </button>

                <div className="p-8" style={{padding: settings?.padding}}>
                  {children}
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

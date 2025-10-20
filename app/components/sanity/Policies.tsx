import {Link} from '~/components/elements/Link';

export function Policies({selectedpolicies}: {selectedpolicies: any}) {
  return (
    <div className="mb-12 md:mb-20" style={{margin: selectedpolicies?.margin}}>
      <div className="container">
        {selectedpolicies?.policiesStyle === 'style1' ? (
          <div className="flex flex-col md:flex-row gap-8 md:gap-2 justify-between">
            {selectedpolicies?.policies.map((item: any) => {
              return (
                <Link
                  key={item._key}
                  to={item.links?.slug ? item?.links?.slug : '/'}
                >
                  <div className="flex flex-col items-center text-left md:text-center lg:text-left">
                    <div className="">
                      {item?.imageUrl && (
                        <img src={item?.imageUrl} alt={item?.title} />
                      )}
                    </div>
                    {item?.title && (
                      <h4 className="font-medium text-lg mt-3">
                        {item?.title}
                      </h4>
                    )}
                    {item?.caption && (
                      <p className="text-gray-500">{item?.caption}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-8 md:gap-2 justify-between flex-col md:flex-row">
            {selectedpolicies?.policies.map((item: any) => {
              return (
                <Link
                  key={item._key}
                  to={item.links?.slug ? item?.links?.slug : '/'}
                >
                  <div className="flex flex-col lg:flex-row items-center md-max:text-center lg:items-start">
                    <div className="rtl:ml-2">
                      {item?.imageUrl && (
                        <img src={item?.imageUrl} alt={item?.title} />
                      )}
                    </div>
                    <div className="ml-0 lg:ml-4 rtl:ml-0">
                      {item?.title && (
                        <h4 className="font-medium text-lg mt-3 lg:mt-0">
                          {item?.title}
                        </h4>
                      )}
                      {item?.caption && (
                        <p className="text-gray-500">{item?.caption}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

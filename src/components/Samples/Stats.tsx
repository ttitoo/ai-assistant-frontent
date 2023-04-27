import { prop } from 'ramda';

const Stats = ({ columnSample }) => {
  return (
    <div className="relative w-full p-px mx-auto mb-4 overflow-hidden transition-shadow duration-300 border rounded lg:mb-8 lg:max-w-6xl group hover:shadow-xl">
      <div className="absolute bottom-0 left-0 w-full h-1 duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100"></div>
      <div className="absolute bottom-0 left-0 w-1 h-full duration-300 origin-bottom transform scale-y-0 bg-deep-purple-accent-400 group-hover:scale-y-100"></div>
      <div className="absolute top-0 left-0 w-full h-1 duration-300 origin-right transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100"></div>
      <div className="absolute bottom-0 right-0 w-1 h-full duration-300 origin-top transform scale-y-0 bg-deep-purple-accent-400 group-hover:scale-y-100"></div>
      <div className="relative flex flex-col items-center h-full py-10 duration-300 bg-white rounded-sm transition-color sm:items-stretch sm:flex-row">
        <div className="px-12 py-8 text-center">
          <h6 className="text-4xl font-bold text-deep-purple-accent-400 sm:text-5xl">
            {prop('count', columnSample)}
          </h6>
          <p className="text-center md:text-base">
            Quota
          </p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-12 py-8 text-center">
          <h6 className="text-4xl font-bold text-deep-purple-accent-400 sm:text-5xl">
            {prop('remaining', columnSample)}
          </h6>
          <p className="text-center md:text-base">
            Remaining
          </p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-12 py-8 text-center">
          <h6 className="text-4xl font-bold text-deep-purple-accent-400 sm:text-5xl">
            106.5K
          </h6>
          <p className="text-center md:text-base">
            Positive
          </p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-12 py-8 text-center">
          <h6 className="text-4xl font-bold text-deep-purple-accent-400 sm:text-5xl">
            106.5K
          </h6>
          <p className="text-center md:text-base">
            Negative
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;

import classNames from 'classnames';
import { Button } from 'flowbite-react';
import { compose, gte, invoker, isNil, lte, prop, unless } from 'ramda';
import { tapLog } from '../../utils/log';

const isRemainingAvailable = compose(gte(0), prop('remaining'));

const progressPercentage = unless(isNil, invoker(1, 'toFixed')(0));

export default ({ columnSample, startAdjust, statistics, }) => (
  <footer className="fixed bottom-0 left-0 z-20 w-full bg-white border-t md:flex md:items-center md:justify-between dark:bg-gray-800 dark:border-gray-600">
    <div className="relative w-full p-px overflow-hidden lg:max-w-6xl group">
      <div className="absolute bottom-0 left-0 w-full h-1 duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100"></div>
      <div className="absolute bottom-0 left-0 w-1 h-full duration-300 origin-bottom transform scale-y-0 bg-deep-purple-accent-400 group-hover:scale-y-100"></div>
      <div className="absolute top-0 left-0 w-full h-1 duration-300 origin-right transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100"></div>
      <div className="absolute bottom-0 right-0 w-1 h-full duration-300 origin-top transform scale-y-0 bg-deep-purple-accent-400 group-hover:scale-y-100"></div>
      <div className="relative flex flex-col items-center h-full duration-300 py-3 bg-white rounded-sm transition-color sm:items-stretch sm:flex-row">
        <div className="px-6 py-2 text-center">
          <h6 className="text-3xl font-bold text-deep-purple-accent-400">
            {prop('count', columnSample)}
          </h6>
          <p className="text-center md:text-base">Quota</p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-6 py-2 text-center">
          <h6 className="text-3xl font-bold text-deep-purple-accent-400">
            {prop('remaining', columnSample)}
          </h6>
          <p className="text-center md:text-base">Remaining</p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-6 py-2 text-center">
          <h6 className="text-3xl font-bold text-deep-purple-accent-400">
            {statistics.positive}
          </h6>
          <p className="text-center md:text-base">Positive</p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-6 py-2 text-center">
          <h6 className="text-3xl font-bold text-deep-purple-accent-400">
            {statistics.negative}
          </h6>
          <p className="text-center md:text-base">Negative</p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-6 py-2 text-center">
          <h6 className="text-3xl font-bold text-deep-purple-accent-400">
            {compose(progressPercentage, prop('positivep'))(statistics)}%
          </h6>
          <p className="text-center md:text-base">Correct</p>
        </div>
        <div className="w-56 h-1 transition duration-300 transform bg-gray-300 rounded-full group-hover:bg-deep-purple-accent-400 group-hover:scale-110 sm:h-auto sm:w-1" />
        <div className="px-6 py-2 text-center">
          <h6 className="text-3xl font-bold text-deep-purple-accent-400">
            {compose(progressPercentage, prop('progress'))(statistics)}%
          </h6>
          <p className="text-center md:text-base">Progress</p>
        </div>
      </div>
    </div>
    <Button disabled={isRemainingAvailable(columnSample)} className="mr-5" onClick={startAdjust}>
      Adjust 
    </Button>
  </footer>
);

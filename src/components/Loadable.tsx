import React from 'react';
import { Transition } from '@headlessui/react'
import { Spinner } from "flowbite-react";

export default ({ loading, children, }) => (
  <>
    <Transition
      show={!loading}
      enter="transition-opacity duration-50"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
    <Transition
      show={loading}
      enter="transition-opacity duration-20"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-20"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="text-center my-20">
        <Spinner color="info" size="xl" />
      </div>
    </Transition>
  </>
);

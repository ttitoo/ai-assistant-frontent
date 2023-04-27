import React from 'react';
import { Breadcrumb } from 'flowbite-react';
import { addIndex, map, prop, propOr } from 'ramda';

export interface BreadcrumbItem {
  title: string
  path: string
}

const genBreadcrumbItem = (item: BreadcrumbItem, index: number) => (
  <Breadcrumb.Item key={index} href={propOr('#', 'path', item)}>
    {prop('title', item)}
  </Breadcrumb.Item>
);

export default ({ items }) => (
  <Breadcrumb className='mb-2'>
    <>
      <Breadcrumb.Item href="/">
        Home
      </Breadcrumb.Item>
      {addIndex(map)(genBreadcrumbItem, items)}
    </>
  </Breadcrumb>
)

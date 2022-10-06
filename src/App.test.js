import React from 'react'
import ButtonSmall from './components/utilities/Buttons';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
    .create(ButtonSmall)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
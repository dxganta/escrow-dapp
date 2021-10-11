import React, { Component } from 'react';

class StakeCard extends Component {
  render() {
    const { title, address, amount, tokenName } = this.props;
    return (
      <div class='card-main'>
        <div class='font-semibold text-lg'>{title}</div>
        <div class='text-black opacity-80 italic'>{address}</div>
        <div class='flex flex-row mt-3 justify-evenly items-center'>
          <div class='border border-gray-500 text-lg rounded-2xl py-2 px-4'>
            {amount} {tokenName}
          </div>
          <div class='py-2 px-10 text-white align-middle font-bold bg-blue-600 hover:bg-blue-700 cursor-pointer rounded-2xl'>
            LOCK
          </div>
        </div>
      </div>
    );
  }
}

export default StakeCard;

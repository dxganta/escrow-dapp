import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import StakeCard from '../components/StakeCard';

export default function Home() {
  return (
    <div class='container mx-auto my-6'>
      <div class='text-xl md:text-3xl font-medium text-center'>
        Transaction Id <span class='italic font-light'>#233841937593749</span>{' '}
      </div>
      <div class='card-main'>
        <div class='text-gray-700 tracking-wide'>Transaction State</div>
        <div class='text-5xl text-gray-500 card-main mt-2 shadow-md'>
          INACTIVE
        </div>
        <div class='mt-4 card-title'>
          Buyer:{' '}
          <span class='card-subtitle'>
            0xaf73867B57900b148Cfdc947bB1af9498cfb5488
          </span>
        </div>
        <div class='card-title'>
          Seller:{' '}
          <span class='card-subtitle'>
            0xaf73867B57900b148Cfdc947bB1af9498cfb5488
          </span>
        </div>
        <div class='card-title'>
          Token: <span class='card-subtitle'>USDC</span>
        </div>
        <div class='card-title'>
          Amount: <span class='card-subtitle'>1000</span>
        </div>
      </div>
      <div class='flex flex-row mt-8'>
        <StakeCard
          title='Buyer'
          address='0xaf73867B57900b148Cfdc947bB1af9498cfb5488'
          amount='2000'
          tokenName='USDC'
        />
        <StakeCard
          title='Seller'
          address='0x5A2019B38F21F42f2291311C88F22183639Bf7bB'
          amount='1000'
          tokenName='USDC'
        />
      </div>
    </div>
  );
}

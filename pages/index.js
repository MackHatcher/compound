import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Compound from '@compound-finance/compound-js';
import calculateApy from '../apy.js';
import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react"
import { injected } from "./components/wallet/connectors.js";
import tokenListMainnet from '../assets/tokenListMainnet.json';
import useBalance from '../actions/useBalance.js';
export function getERC20Contract(tokenAddress, web3) {
  return web3 ? new web3.eth.Contract(ERC20ABI, tokenAddress, {
    from: web3.eth.defaultAccount,
  })
  : null
}

export default function Home({ apys }) {
  
  const [selectedToken, setSelectedToken] = useState(tokenListMainnet[0])

  const { active, account, library, connector, activate, deactivate } = useWeb3React()

  const [balance] = useBalance(
    selectedToken.address,
    selectedToken.decimals
  )

  const formatPercent = number => 
    `${new Number(number).toFixed(2)}%`
    
    
    async function connect() {
      try {
        await activate(injected)
        localStorage.setItem('isWalletConnected', true)
      } catch (ex) {
        console.log(ex)
      }
    }

    async function disconnect() {
      try {
        deactivate()
        localStorage.setItem('isWalletConnected', false)
      } catch (ex) {
        console.log(ex)
      }
    }
  
    useEffect(() => {
      const connectWalletOnPageLoad = async () => {
        if (localStorage?.getItem('isWalletConnected') === 'true') {
          try {
            await activate(injected)
            localStorage.setItem('isWalletConnected', true)
          } catch (ex) {
            console.log(ex)
          }
        }
      }
      connectWalletOnPageLoad()
    }, [])
  

  return (
    <div className='container'>
      <Head>
        <title>Compound dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>      
      <div className="flex flex-col items-center justify-center">
      {active ? <button onClick={disconnect} className="">Disconnect</button> : <button onClick={connect} className="">Connect to MetaMask</button>}
      {active ? <span>Connected with <b>{account}</b></span> : <span>Not connected</span>}      
    </div>
    <div className='main'>
      <div className='row mt-4'>
        <div className='col-sm-12'>
          <div className="jumbotron">
            <h1 className='text-center'>Compound Dashboard</h1>
            {/* <h5 className="display-4 text-center">Shows Compound APYs <br/> with COMP token rewards</h5> */}
          </div>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Supply APY</th>
            <th>COMP APY</th>
            <th>Total APY</th>
          </tr>
        </thead>
        <tbody>
          {apys && apys.map(apy => (
            <tr key={apy.ticker}>
              <td>
                <img 
                  src={`img/${apy.ticker.toLowerCase()}.png`} 
                  style={{width: 25, height: 25, marginRight: 10}} 
                />
                {apy.ticker.toUpperCase()}
              </td>
              <td>
                {formatPercent(apy.supplyApy)}
              </td>
              <td>
                {formatPercent(apy.compApy)}
              </td>
              <td>
                {formatPercent(parseFloat(apy.supplyApy) + parseFloat(apy.compApy))}
              </td>              
            </tr>
        ))}
          </tbody>          
        </table>
        <div className={styles.container}>      
          <select onChange={(e) => setSelectedToken(tokenListMainnet[e.target.value])}>
            {tokenListMainnet.map((token, index) => (
              <option value={index} key={token.address}>{token.name}</option>
            ))}
          </select>
          {selectedToken.name} balance {balance}
        </div>
      </div>      
    </div>
  )
}

export async function getServerSideProps(context) {
  const apys = await Promise.all([
    calculateApy(Compound.cDAI, 'DAI'),
    calculateApy(Compound.cUSDC, 'USDC'),
    calculateApy(Compound.cUSDT, 'USDT'),
    calculateApy(Compound.cBAT, 'BAT'),
    calculateApy(Compound.cAAVE, 'AAVE'),
    calculateApy(Compound.cETH, 'ETH'),
    calculateApy(Compound.cLINK, 'LINK'),    
  ]);  

  return {
    props: {
      apys
    },
  }
}
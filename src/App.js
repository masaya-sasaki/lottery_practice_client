import './App.css';
import {useEffect, useState} from 'react'
import lottery from './Lottery.json'
import {ethers} from 'ethers'

const lotteryAddress = '0x28c6a25396cd2eC3E98Eaef8EB5dbF9F06fA9dac'

function App() {
  const [accounts, setAccounts] = useState([])
  const [entryFee, setEntryFee] = useState(0)
  const [managerAddress, setManagerAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [numberOfEntrants, setNumberOfEntrants] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
    useEffect(
      () => {
        const getInitialData = async () => {
          if(window.ethereum){
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            console.log(`provider is ${provider} and address is $${lotteryAddress} and abi is ${lottery.abi}`)
            const LotteryContract = new ethers.Contract(lotteryAddress, lottery.abi, provider)
            const manager = await LotteryContract.manager()
            const players = await LotteryContract.getPlayers()
            const value = await provider.getBalance(lotteryAddress)
            const ethervalue = ethers.utils.formatEther(value)
            setManagerAddress(manager)
            setNumberOfEntrants(players.length)
            setTotalValue(ethervalue)
          }   
        }
        getInitialData();
      }
      ,[]);

  const handleChange = (event) => {
    setEntryFee(event.target.value)
  }

  const enterLottery = async  () => {
    if(!window.ethereum) return
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    console.log(`provider is ${provider}, signer is ${signer} and address is $${lotteryAddress} and abi is ${lottery.abi}`)
    const LotteryContract = new ethers.Contract(lotteryAddress, lottery.abi, signer)
    if(entryFee < 0.01){
      setStatusMessage('Minimum Entry Fee is 0.01 ether')
      return 
    }
    const entryFeeString = entryFee.toString()
    setStatusMessage('Waiting on transaction success...')
    await LotteryContract.enter({ value: ethers.utils.parseUnits(entryFeeString, "ether") })
    setStatusMessage('You have been entered.')
  }

  const pickWinner = async () => {
    if(!window.ethereum) return 
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const LotteryContract = new ethers.Contract(lotteryAddress, lottery.abi, signer)
    setStatusMessage('Waiting on transaction success...')
    await LotteryContract.pickWinner()
    setStatusMessage('Winner is selected!')
  }

  const connectAccount = async () => {
    if(window.ethereum){
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts', 
      });
      setAccounts(accounts[0]); 
      setIsConnected(true);
    }
  }

  return (
    <div className="App">
      <header className='header'>
        <h1 className='title'>Lottery Contract</h1>
        <div className='connect'>
        {isConnected ? <button style={{'backgroundColor': "#FFEA00"}}>Connected</button>: <button onClick={connectAccount}>Connect to Metamask</button>}
        </div>
      </header>
      <div className='box info'>
        <h2>Contract Information</h2>
        <p>
          This is a lottery contract on Ethereum Goerlin test network at the address {lotteryAddress} managed by {managerAddress}.
          <br/>
          Currently, {numberOfEntrants} people entered, competing for the total value of {totalValue} ether. 
        </p>
      </div>
      <div className='box enter'>
        <h2>Enter</h2>
        <p>Do you want to enter the lottery? Minimum entry fee .01 ether. </p>
        <label htmlFor='entryfee'>Enter amount of ether: </label>
        <input type='number' name='entryfee' id='entryfee' value={entryFee} onChange={handleChange}></input>
        <button className='contract-button' onClick={enterLottery}>Enter</button>
      </div>
      <div className='box pick'>
        <h2>Pick</h2>
        <p>Ready to pick the winner? (Only manager can call) </p>
        <button className='contract-button' onClick={pickWinner}>Pick Winner</button>
      </div>
      <div className='box status'>
        <h2>Status</h2>
        {statusMessage}
      </div>
    </div>
  );
}

export default App;

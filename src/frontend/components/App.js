import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./Navbar";
import ListNft from "./ListNft.js";
import Create from "./Create.js";
import Home from "./Home.js";
import { useState } from "react";
import { ethers } from "ethers";
import { Spinner } from "react-bootstrap";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});

  const [data, setData] = useState();
  const [state, setState] = useState(false);
  const [marketplace, setMarketplace] = useState({});
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async function (accounts) {
      setAccount(accounts[0]);
      await web3Handler();
    });
    loadContracts(signer);

    setState(true);
  };
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    // const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    // const Marketplace = new ethers.Contract(
    //   MarketplaceAddress.address,
    //   MarketplaceAbi.abi,
    //   signer
    // );
    setNFT(nft);
    //setMarketplace(Marketplace);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
              }}
            >
              <Spinner animation="border" style={{ display: "flex" }} />
              <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Home marketplace={marketplace} nft={nft} state={state} />
                }
              />
              {/* <Route
                path="/lazyMinting"
                element={<LazyMinting marketplace={marketplace} nft={nft} />}
              /> */}
              <Route
                path="/create"
                element={<Create marketplace={marketplace} nft={nft} />}
              />
              <Route
                path="/ListNft"
                element={
                  <ListNft
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />
              {/* <Route
                path="/my-purchases"
                element={
                  <MyPurchases
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  /> */}
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

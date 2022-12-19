import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import NFTABI from "../contractsData/MyToken.json";
import NFTAddress from "../contractsData/MyToken-address.json";
import marketplace from "../contractsData/NftMarketplace-address.json";
const Create = () => {
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  const ListNft = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const token = new ethers.Contract(NFTAddress.address, NFTABI.abi, signer);
    let ABI = [
      "function listItem(address nftAddress,uint256 tokenId,uint256 price)external",
    ];
    let iface = new ethers.utils.Interface(ABI);
    const encodedFunction = iface.encodeFunctionData("listItem", [
      address,
      tokenId,
      price,
    ]);

    await (await token.setApprovalForAll(marketplace.address, true)).wait();
    console.log("encoded function", encodedFunction);
  };
  return (
    <>
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 mx-auto"
            style={{ maxWidth: "1000px" }}
          >
            <div className="content mx-auto">
              <Row className="g-4">
                <Form.Control
                  onChange={(e) => setAddress(e.target.value)}
                  size="lg"
                  required
                  type="text"
                  placeholder="Address"
                />
                <Form.Control
                  onChange={(e) => setTokenId(e.target.value)}
                  size="lg"
                  required
                  as="textarea"
                  placeholder="TokenId"
                />
                <Form.Control
                  onChange={(e) => setPrice(e.target.value)}
                  size="lg"
                  required
                  type="number"
                  placeholder="Price in ETH"
                />
                <div className="d-grid px-0">
                  <Button onClick={ListNft} variant="primary" size="lg">
                    List NFT!
                  </Button>
                </div>
              </Row>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Create;

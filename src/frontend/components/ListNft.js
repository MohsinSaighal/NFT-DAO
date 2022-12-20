import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import NFTABI from "../contractsData/MyToken.json";
import NFTAddress from "../contractsData/MyToken-address.json";
import marketplace from "../contractsData/NftMarketplace-address.json";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
const Create = () => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const projectId = "2I1oqhW4ncFv71LUKDOVWWRZ1ZH"; // <---------- your Infura Project ID
  const projectSecret = "d8538b15a850ae329e8b348dbbd6311d"; // <---------- your Infura Secret
  const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = await event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        setImage(
          `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`
        );
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    try {
      const result = await client.add(
        JSON.stringify({ image, name, description })
      );

      const results = `https://marketplace-argon.infura-ipfs.io/ipfs/${result.path}`;

      ListNft(results);
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };

  const ListNft = async (results) => {
    console.log(results);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const token = new ethers.Contract(NFTAddress.address, NFTABI.abi, signer);
    const uri = results;
    // mint nft
    await (await token.mint(uri, marketplace.address)).wait();
    // get tokenId of new nft
    const id = await token.tokenCount();
    console.log(id.toString());
    let ABI = [
      "function listItem(address nftAddress,uint256 tokenId,uint256 price)external",
    ];
    let iface = new ethers.utils.Interface(ABI);
    const priceNFT = ethers.utils.parseEther(price);
    const encodedFunction = iface.encodeFunctionData("listItem", [
      token.address,
      id,
      priceNFT,
    ]);

    console.log("encoded function", encodedFunction);
  };
  return (
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
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;

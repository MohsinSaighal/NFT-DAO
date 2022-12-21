import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Col, Card } from "react-bootstrap";

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [soldItems, setSoldItems] = useState([]);
  const [price, setPrice] = useState("");
  const loadPurchaseItem = async () => {
    // Load all sold items that the user listed
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const itemCount = await marketplace.itemCount();
    let soldItems = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx);
      const owner = await nft.ownerOf(i.itemId);
      if (i.sold === true && owner === address) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.itemId);
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        // define listed item object
        let item = {
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        soldItems.push(item);
        // Add listed item to sold items array if sold
      }
    }
    setLoading(false);
    setSoldItems(soldItems);
  };
  const SellItem = async (item) => {
    console.log(item);
    let ABI = [
      "function listItem(address nftAddress,uint256 tokenId,uint256 price)external",
    ];
    let iface = new ethers.utils.Interface(ABI);
    console.log("here");
    const priceNFT = ethers.utils.parseEther(price);
    const encodedFunction = iface.encodeFunctionData("listItem", [
      nft.address,
      item.itemId,
      priceNFT,
    ]);
    await await nft.approve(marketplace.address, item.itemId);

    console.log("encoded function", encodedFunction);
  };
  useEffect(() => {
    loadPurchaseItem();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {soldItems.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {soldItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Form.Control
                      onChange={(e) => setPrice(e.target.value)}
                      size="lg"
                      required
                      type="number"
                      placeholder="Price in ETH"
                    />
                    <div className="d-grid">
                      <Button
                        onClick={() => SellItem(item)}
                        variant="primary"
                        size="lg"
                      >
                        Sell Item {""}
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
}

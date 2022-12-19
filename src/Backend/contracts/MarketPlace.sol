// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();


// Error thrown for isNotOwner modifier
// error IsNotOwner()

contract NftMarketplace is ReentrancyGuard,Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _nftsSold;
    Counters.Counter private _nftCount;
    uint public itemCount;

    struct Item {
        uint itemId;
        address nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }


    struct Listing {
        uint256 price;
        address seller;
        bool active;
    }

    struct  NFT {
      address nftContract;
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool listed;
  }
    

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event NFTListed(
        address owner,
        address user,
        address nftContract,
        uint256 tokenId,
        uint256 amountPerMinute,
        uint256 expires
    );

     event NFTUnlisted(
        address unlistSender,
        address nftContract,
        uint256 tokenId
    );

    event NFTRented(
        address owner,
        address user,
        address nftContract,
        uint256 tokenId,
        uint64 expires,
        uint256 DueAmount
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;
    mapping(uint256 => NFT) private _idToNFT;
    mapping(uint => Item) public items;

    

    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }

     // IsNotOwner Modifier - Nft Owner can't buy his/her NFT
    // Modifies buyItem function
    // Owner should only list, cancel listing or update listing
     modifier isNotOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender == owner) {
            revert NotOwner();
        }
        _;
    } 

    /////////////////////
    // Main Functions //
    /////////////////////
    /*
     * @notice Method for listing NFT
     * @param nftAddress Address of NFT contract
     * @param tokenId Token ID of NFT
     * @param price sale price for each item
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external

        notListed(nftAddress, tokenId, msg.sender)
        //isOwner(nftAddress, tokenId, msg.sender)
    {   itemCount ++;
        require(price > 0,"Price Must Be Above Zero");
        IERC721 nft = IERC721(nftAddress);       
        require(nft.getApproved(tokenId)!= address(this),"Not Approved For Market Place");
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender,true);
        
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
        
      _idToNFT[tokenId] = NFT(
      nftAddress,
      tokenId, 
      payable(msg.sender),
      payable(address(this)),
      price,
      true
    );
     items[itemCount] = Item (
            itemCount,
            nftAddress,
            tokenId,
            price,
            payable(msg.sender),
            false
        );
    }
    
    
    /*
     * @notice Method to  Rent NFT
     * @param nftContract Address of NFT contract
     * @param tokenId Token ID of NFT
     * @param expires Expiry for NFT
     */

    /*
     * @notice Method for cancelling listing
     * @param nftAddress Address of NFT contract
     * @param tokenId Token ID of NFT
     */
    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {   
        s_listings[nftAddress][tokenId].active = false;
        IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }


    /*
     * @notice Method for buying listing
     * @notice The owner of an NFT could unapprove the marketplace,
     * which would cause this function to fail
     * Ideally you'd also have a `createOffer` functionality.
     * @param nftAddress Address of NFT contract
     * @param tokenId Token ID of NFT
     */
     function purchaseItem(uint _itemId) external payable nonReentrant {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(!item.sold, "item already sold");
        require(msg.sender != item.seller,"Owner of NFT Cant Buy Their Nft");
        // pay seller and feeAccount
        item.seller.transfer(item.price);
        // update item to sold
        item.sold = true;
        // transfer nft to buyer
        IERC721(item.nft).transferFrom(address(this), msg.sender, item.tokenId);
        // emit Bought event
        emit ItemBought(
            msg.sender,
            address(item.nft),
            item.tokenId,
            item.price
        );
        
    }

    

}
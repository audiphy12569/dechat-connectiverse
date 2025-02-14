// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeChat is ERC2771Context, Ownable {
    struct Message {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        bool isImage;
        bool isEthTransfer;
        uint256 ethAmount;
        bool isVoiceMessage;
    }

    // Mapping from user address to their messages
    mapping(address => Message[]) private userMessages;
    // Mapping to track conversations between users
    mapping(address => address[]) private userConversations;
    // Mapping for usernames (address => username)
    mapping(address => string) private usernames;
    // Mapping to track if a username is taken
    mapping(string => bool) private usernameExists;

    event MessageSent(
        address indexed sender,
        address indexed recipient,
        string content,
        uint256 timestamp,
        bool isImage,
        bool isEthTransfer,
        uint256 ethAmount,
        bool isVoiceMessage
    );

    event UsernameSet(address indexed user, string username);

    constructor() 
        ERC2771Context(0x85d4F7d979A3870a7edb81BB3C734d9bC2B24068)
        Ownable(msg.sender) 
    {}

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    function sendMessage(address _recipient, string memory _content, bool _isImage, bool _isVoiceMessage) external {
        require(_recipient != address(0), "Invalid recipient address");
        
        address sender = _msgSender();
        
        Message memory newMessage = Message({
            sender: sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isImage: _isImage,
            isEthTransfer: false,
            ethAmount: 0,
            isVoiceMessage: _isVoiceMessage
        });

        userMessages[sender].push(newMessage);
        userMessages[_recipient].push(newMessage);

        _addToConversations(sender, _recipient);
        _addToConversations(_recipient, sender);

        emit MessageSent(
            sender,
            _recipient,
            _content,
            block.timestamp,
            _isImage,
            false,
            0,
            _isVoiceMessage
        );
    }

    function sendEthWithMessage(address payable _recipient, string memory _content) external payable {
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.value > 0, "Must send some ETH");

        address sender = msg.sender;

        Message memory newMessage = Message({
            sender: sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isImage: false,
            isEthTransfer: true,
            ethAmount: msg.value,
            isVoiceMessage: false
        });

        userMessages[sender].push(newMessage);
        userMessages[_recipient].push(newMessage);

        _addToConversations(sender, _recipient);
        _addToConversations(_recipient, sender);

        (bool sent, ) = _recipient.call{value: msg.value}("");
        require(sent, "Failed to send ETH");

        emit MessageSent(
            sender,
            _recipient,
            _content,
            block.timestamp,
            false,
            true,
            msg.value,
            false
        );
    }

    function setUsername(string memory _username) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 32, "Username too long");
        require(!usernameExists[_username], "Username already taken");
        
        address sender = _msgSender();
        string memory oldUsername = usernames[sender];
        if (bytes(oldUsername).length > 0) {
            usernameExists[oldUsername] = false;
        }
        
        usernames[sender] = _username;
        usernameExists[_username] = true;
        
        emit UsernameSet(sender, _username);
    }

    function getUserMessages(address _user) external view returns (Message[] memory) {
        return userMessages[_user];
    }

    function getUserConversations(address _user) external view returns (address[] memory) {
        return userConversations[_user];
    }

    function getUsername(address _user) external view returns (string memory) {
        return usernames[_user];
    }

    function _addToConversations(address _user1, address _user2) private {
        address[] storage conversations = userConversations[_user1];
        bool exists = false;
        
        for (uint i = 0; i < conversations.length; i++) {
            if (conversations[i] == _user2) {
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            userConversations[_user1].push(_user2);
        }
    }
}
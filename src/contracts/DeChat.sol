// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DeChat {
    struct Message {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        bool isImage;
        bool isEthTransfer;
        uint256 ethAmount;
    }

    // Mapping from user address to their messages
    mapping(address => Message[]) private userMessages;
    // Mapping to track conversations between users
    mapping(address => address[]) private userConversations;

    event MessageSent(
        address indexed sender,
        address indexed recipient,
        string content,
        uint256 timestamp,
        bool isImage,
        bool isEthTransfer,
        uint256 ethAmount
    );

    function sendMessage(address _recipient, string memory _content, bool _isImage) external {
        require(_recipient != address(0), "Invalid recipient address");
        
        Message memory newMessage = Message({
            sender: msg.sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isImage: _isImage,
            isEthTransfer: false,
            ethAmount: 0
        });

        userMessages[msg.sender].push(newMessage);
        userMessages[_recipient].push(newMessage);

        // Add to conversations if not already present
        _addToConversations(msg.sender, _recipient);
        _addToConversations(_recipient, msg.sender);

        emit MessageSent(
            msg.sender,
            _recipient,
            _content,
            block.timestamp,
            _isImage,
            false,
            0
        );
    }

    function sendEthWithMessage(address payable _recipient, string memory _content) external payable {
        require(_recipient != address(0), "Invalid recipient address");
        require(msg.value > 0, "Must send some ETH");

        Message memory newMessage = Message({
            sender: msg.sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isImage: false,
            isEthTransfer: true,
            ethAmount: msg.value
        });

        userMessages[msg.sender].push(newMessage);
        userMessages[_recipient].push(newMessage);

        // Add to conversations if not already present
        _addToConversations(msg.sender, _recipient);
        _addToConversations(_recipient, msg.sender);

        // Transfer ETH
        (bool sent, ) = _recipient.call{value: msg.value}("");
        require(sent, "Failed to send ETH");

        emit MessageSent(
            msg.sender,
            _recipient,
            _content,
            block.timestamp,
            false,
            true,
            msg.value
        );
    }

    function getUserMessages(address _user) external view returns (Message[] memory) {
        return userMessages[_user];
    }

    function getUserConversations(address _user) external view returns (address[] memory) {
        return userConversations[_user];
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
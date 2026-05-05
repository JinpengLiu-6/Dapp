// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SocialApp {
    struct Post {
        address author;
        string cid;
        uint256 timestamp;
        uint256 likeCount;
    }

    Post[] private posts;

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string cid,
        uint256 timestamp
    );

    event PostLiked(
        uint256 indexed postId,
        address indexed liker,
        uint256 likeCount
    );

    function createPost(string calldata cid) external {
        require(bytes(cid).length > 0, "CID_REQUIRED");

        uint256 postId = posts.length;
        uint256 createdAt = block.timestamp;

        posts.push(
            Post({
                author: msg.sender,
                cid: cid,
                timestamp: createdAt,
                likeCount: 0
            })
        );

        emit PostCreated(postId, msg.sender, cid, createdAt);
    }

    function likePost(uint256 postId) external {
        require(postId < posts.length, "POST_NOT_FOUND");

        Post storage post = posts[postId];
        post.likeCount += 1;

        emit PostLiked(postId, msg.sender, post.likeCount);
    }

    function getPosts() external view returns (Post[] memory) {
        return posts;
    }
}

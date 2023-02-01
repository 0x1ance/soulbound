# Soulbound by 0x1ance

This implementation of Soulbound Standard is my humble contribution to the bright future of web3 society, inspired by Vitalik Buterin's SBT whitepaper (Decentralized Society: Finding Web3's Soul) at https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763, and his blog https://vitalik.ca/general/2022/01/26/soulbound.html.

## Install

```
npm install @dooot/soulbound
```

Or if you use yarn

```
yarn add @dooot/soulbound
```

## Usage

To write your custom contracts, import ours and extend them through inheritance.

```solidity
pragma solidity 0.8.17;

import '@dooot/soulbound/contracts/sbt/ERC721SoulBound/ERC721SoulBound.sol';

contract BoredGorillaERC721Soulbound is ERC721Soulbound {
    constructor(
        string memory name_,
        string memory symbol_,
        address soulhub_
    ) ERC721Soulbound(name_, symbol_, soulhub_) {
    }
}
```

> Please refer to sbt/ERC721Soulbound & examples/WishERC721Soulbound
> You need an ethereum development framework for the above import statements to work! Check out these guides for [Hardhat], [Truffle] or [Embark].

# Concept Walkthrough

The implementation of Soulbound standard by 0x1ance is composed of three main components:

> 1. Soulhub contract
> 2. Soulhub manager contract
> 3. Soulbound contract

## Soulhub Contract

**A soulhub contract is an organization-wise user management system to identify & manage the activity of users registered in the organization through their wallet addresses**, it also provides a verification service for satellite soulbound contracts to verify the identity of accounts based on the corresponding bounded user soul.

The identity of each user in the soulhub contract will be represented by a unique user soul, while the user wallet address will be bound to that user soul upon the wallet address registration (_either by the soulhub administrator or through an authentication signature_). This user soul will be used to identify and manage the activities of that user through blockchain transactions from the corresponding bound wallet address. Considering various business requirements, the structural design of this soulhub contract allows the organization to bind multiple wallet addresses to the same user soul. In general, this contract serves as **a general data store for all the user data in the organization**.

## Soulhub Manager Contract

A soulhub manager contract provides the administrator role management functionality for a soulhub contract, which defines the organizational structure, by granting the administrator role to accounts (either contracts or wallet). 

There are two main functionalities for the **soulhub administrator role**:

> 1. **perform the administrative operations of the soulhub contract**, including setting the user`s wallet address to the corresponding soul, or signing an authorization signature to users to set their wallet address to the corresponding soul themselves, etc.
> 
> 2. **manage the user activities of the organization-controlled soulbound contract, which is already subscribed to the soulhub contract**. This is highly customizable, based on the business requirements of each soulbound contract, for example signing an authorization signature to users so they can mint an ERC721Soulbound token, or calling certain soulbound contract functions specifically required the caller as the soulhub administrator.

The reason behind separating the soulhub manager contract from the soulhub contract is to **provide flexibility for soulhub owners and to grant the soulhub administrator role in a way based on the business requirement**. Besides directly setting an address as a soulhub administrator, this design supports more interesting implementations, taking soulhub of a DAO as a possible implementation direction, _the DAO owner can grant a soulhub administrator role to users by airdropping a soulbound ERC721 token_, or even develop a more complex organizational structure based on it.

Even when the organization pivots and changes its business requirement, the soulhub account can easily develop and set up a new soul manager contract fulfilling new requirements.

## Soulbound Contract

A soulbound contract is the satellite contract of the organizational soulhub contract(s).

There are two core purposes for a contract to subscribe to the soulhub as a soulbound contract

> 1. serves as **an organization-controlled contract under the subscribed soulhub contract owned by the organization**, to satisfy business requirements. Examples can be found in sbt/ERC721Soulbound: _soulhub administrators can sign a message hash, to authorize the user to perform the mint function_. Or a more complex business case study as the Moxport contract: _the moxport contract has been granted as a soulhub administrator role, therefore it can mint the soulbound ERC721 wish token when users call the mintWish function_.
> 
> 2. leverages a reputable, trustable organizational soulhub contract for user identity/information verification (_e.g. to verify whether an address is an active, real person by checking if that address has a valid soul in a famous soulhub contract, etc._).

## Thoughts by 0x1ance towards Vitalik Buterin's thought-provoking SBT whitepaper

To design a more organized, manageable web3 society for the general public, meanwhile reaching an equilibrium between centralization & decentralization (or **privacy & transparency**), SBT is a brilliant intermediate for us to structure the web3 society.

I would like to perceive the whole blockchain as the general ledger, while the soulhub contract of each organization (governments, companies, private societies, etc.) is a sub-ledger. Everything that happened within the sub-ledger is fully controlled by the organization, while the output of each sub-ledger can be viewed as a summary of all the user activities. Through the soulbound subscription pattern, we can explore two information flows:

> 1. **top-down**: instructions from top to lower hierarchy, like soulbound contracts with activities fully managed by the soulhub organization
> 
> 2. **bottom-up**: information feed from low/equal up to high hierarchy (data consumer), soulbound contracts only consume the user validation result from soulhub to perform their business logic but not controlled by the soulhub

Meanwhile, the relationship doesn`t have to be unidirectional, which allows us to implement a more sophisticated & intelligent web3 network among different entities.

## Summary

The main purpose of this project is to deliver an easy, understandable introduction of the decentralized society (DeSoc) & soulbound token (SBT) to the general web3 developers.

My excitement about how we can shape the future web3 society as a blockchain/web3 engineer is beyond words. Great thanks to the talented team & Vitalik Buterin for publishing such an inspiring paper over DeSoc, which paves the way for the web3 community to transform our ecosystem into a more organized and structural way.

There's still much room for improvement in the code, therefore it is highly welcomed to open issues and discussions on how can we construct the future decentralized society in a better way, &
bring a more inclusive Soulbound standard for everyone to adopt easily.

## License

This contract is is released under the [MIT License](LICENSE).

[Truffle]: https://truffleframework.com/docs/truffle/quickstart
[Embark]: https://embark.status.im/docs/quick_start.html
[Hardhat]: https://hardhat.org/hardhat-runner/docs/getting-started

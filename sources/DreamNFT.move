module final_project::DreamNFT;

use std::string;
use sui::event;
use sui::coin::{Self, Coin};
use sui::balance::{Self, Balance};
use sui::sui::SUI;

public struct DreamNFT has key {
    id: UID,
    owner: address,
    title: string::String,
    goalAmount: u64,
    savedAmount: u64,
    pledgedFunds: Balance<SUI>, // Store actual SUI tokens
    isComplete: bool,
    isApproved: bool,
    hasVault: bool,
    description: string::String,
}

public struct LegacyWall has key {
    id: UID,
    // owner: address,
    completedDreams: vector<ID>,
}

public struct AdminCap has key {
    id: UID,
}

public struct MintedNFT has copy, drop {
    dreamID: ID,
    owner: address,
    title: string::String,
    goalAmount: u64,
    description: string::String,
}

public struct Pledged has copy, drop {
    pledgedAmount: u64,
}

// Initialize admin capability
fun init(ctx: &mut TxContext) {
    let adminCap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(adminCap, ctx.sender());
}

public entry fun addToLegacyWall(wall: &mut LegacyWall, dream: &mut DreamNFT) {
    assert!(dream.isComplete, 0);
    vector::push_back(&mut wall.completedDreams, object::id(dream));
}

public fun getDreamID(dream: &DreamNFT): ID {
    object::id(dream)
}

public entry fun mintDream(
    title: string::String,
    goalAmount: u64,
    description: string::String,
    ctx: &mut TxContext,
) {
    let dream = DreamNFT {
        id: object::new(ctx),
        owner: ctx.sender(),
        title: title,
        goalAmount: goalAmount,
        savedAmount: 0,
        pledgedFunds: balance::zero<SUI>(), // Initialize empty balance
        isComplete: false,
        isApproved: false,
        hasVault: false,
        description: description,
    };

    event::emit(MintedNFT {
        dreamID: object::id(&dream),
        owner: dream.owner,
        title: dream.title,
        goalAmount: dream.goalAmount,
        description: dream.description,
    });
    
    // Make the dream a shared object so others can interact with it
    transfer::share_object(dream);
}

// Admin function to approve dreams
public entry fun approveDream(_: &AdminCap, dream: &mut DreamNFT) {
    dream.isApproved = true;
}

// Admin function to reject dreams
public entry fun rejectDream(_: &AdminCap, dream: &mut DreamNFT) {
    dream.isApproved = false;
}

// Function to mark that a vault has been created for this dream
public entry fun markVaultCreated(_: &AdminCap, dream: &mut DreamNFT) {
    dream.hasVault = true;
}

// Accept actual SUI tokens when pledging
public entry fun pledgeToDream(nft: &mut DreamNFT, payment: Coin<SUI>) {
    assert!(nft.isApproved, 1); // Error code 1: Dream not approved
    assert!(nft.hasVault, 2); // Error code 2: Dream has no vault
    
    let amount = coin::value(&payment);
    let payment_balance = coin::into_balance(payment);
    
    // Add the actual SUI tokens to the dream's balance
    balance::join(&mut nft.pledgedFunds, payment_balance);
    
    // Update the tracked amount
    nft.savedAmount = nft.savedAmount + amount;
    if (nft.savedAmount >= nft.goalAmount) {
        nft.isComplete = true;
    };
    
    event::emit(Pledged {
        pledgedAmount: amount,
    });
}

// Function to release all funds to the dream owner
public entry fun releaseFunds(nft: &mut DreamNFT, ctx: &mut TxContext) {
    assert!(nft.isComplete, 0); // Only complete dreams can release funds
    assert!(ctx.sender() == nft.owner, 1); // Only owner can release
    
    let total_balance = balance::withdraw_all(&mut nft.pledgedFunds);
    let total_coin = coin::from_balance(total_balance, ctx);
    
    // Transfer all funds to the dream owner
    transfer::public_transfer(total_coin, nft.owner);
}

public fun isComplete(nft: &DreamNFT): bool {
    nft.isComplete
}

public fun isApproved(nft: &DreamNFT): bool {
    nft.isApproved
}

public fun hasVault(nft: &DreamNFT): bool {
    nft.hasVault
}

public fun addMatchAmount(dream: &mut DreamNFT, match_payment: Balance<SUI>) {
    let amount = balance::value(&match_payment);
    balance::join(&mut dream.pledgedFunds, match_payment);
    
    dream.savedAmount = dream.savedAmount + amount;
    if (dream.savedAmount >= dream.goalAmount) {
        dream.isComplete = true;
    };
}

// Get all dreams (admin function)
public fun getAllDreams(): vector<DreamNFT> {
    vector::empty<DreamNFT>()
}

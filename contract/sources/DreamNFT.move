module final_project::DreamNFT;

use std::string;

// use sui::balance;
// use sui::sui;
// use sui::transfer;
// use sui::object::UID;
// use sui::tx_context::TxContext;

public struct DreamNFT has key {
    id: UID,
    owner: address,
    title: string::String,
    goalAmount: u64,
    savedAmount: u64,
    isComplete: bool,
    isApproved: bool,
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

public entry fun mintDream(title: string::String, goalAmount: u64, description: string::String, ctx: &mut TxContext) {
    let dream = DreamNFT {
        id: object::new(ctx),
        owner: ctx.sender(),
        title: title,
        goalAmount: goalAmount,
        savedAmount: 0,
        isComplete: false,
        isApproved: false,
        description: description,
    };
    transfer::transfer(dream, ctx.sender());
}

// Admin function to approve dreams
public entry fun approveDream(_: &AdminCap, dream: &mut DreamNFT) {
    dream.isApproved = true;
}

// Admin function to reject dreams
public entry fun rejectDream(_: &AdminCap, dream: &mut DreamNFT) {
    dream.isApproved = false;
}

// Only allow pledging to approved dreams
public entry fun pledgeToDream(nft: &mut DreamNFT, amount: u64) {
    assert!(nft.isApproved, 1); // Error code 1: Dream not approved
    nft.savedAmount = nft.savedAmount + amount;
    if (nft.savedAmount >= nft.goalAmount) {
        nft.isComplete = true;
    };
}

public fun isComplete(nft: &DreamNFT): bool {
    nft.isComplete
}

public fun isApproved(nft: &DreamNFT): bool {
    nft.isApproved
}

public fun addMatchAmount(dream: &mut DreamNFT, amount: u64) {
    dream.savedAmount = dream.savedAmount + amount;
    if (dream.savedAmount >= dream.goalAmount) {
        dream.isComplete = true;
    };
}

// Get all dreams (admin function)
public fun getAllDreams(): vector<ID> {
    // This would need to be implemented differently in a real scenario
    // For now, we'll use a different approach
    vector::empty()
}

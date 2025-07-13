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
}

public struct LegacyWall has key {
    id: UID,
    // owner: address,
    completedDreams: vector<ID>,
}

public entry fun addToLegacyWall(wall: &mut LegacyWall, dream: &mut DreamNFT) {
    assert!(dream.isComplete, 0);
    vector::push_back(&mut wall.completedDreams, object::id(dream));
}

public fun getDreamID(dream: &DreamNFT): ID {
    object::id(dream)
}

public entry fun mintDream(title: string::String, goalAmount: u64, ctx: &mut TxContext) {
    let dream = DreamNFT {
        id: object::new(ctx),
        owner: ctx.sender(),
        title: title,
        goalAmount: goalAmount,
        savedAmount: 0,
        isComplete: false,
    };
    transfer::transfer(dream, ctx.sender());
}

public entry fun pledgeToDream(nft: &mut DreamNFT, amount: u64) {
    nft.savedAmount = nft.savedAmount + amount;
    if (nft.savedAmount >= nft.goalAmount) {
        nft.isComplete = true;
    };
}

public fun isComplete(nft: &DreamNFT): bool {
    nft.isComplete
}

public fun addMatchAmount(dream: &mut DreamNFT, amount: u64) {
    dream.savedAmount = dream.savedAmount + amount;
    if (dream.savedAmount >= dream.goalAmount) {
        dream.isComplete = true;
    };
}

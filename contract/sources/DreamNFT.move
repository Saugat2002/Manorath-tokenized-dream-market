module final_project::DreamNFT;

use std::string;
use sui::event;

public struct DreamCreated has copy, drop {
    dream_id: ID,
    creator: address,
    title: string::String,
    goal_amount: u64,
}

public struct DreamApproved has copy, drop {
    dream_id: ID,
    approved_by: address,
}

public struct DreamRejected has copy, drop {
    dream_id: ID,
    rejected_by: address,
}

public struct DreamCompleted has copy, drop {
    dream_id: ID,
    completed_by: address,
}

public struct PledgeMade has copy, drop {
    dream_id: ID,
    pledger: address,
    amount: u64,
}

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

// Global registry to track all dreams
public struct DreamRegistry has key {
    id: UID,
    allDreams: vector<ID>,
}

public struct AdminCap has key {
    id: UID,
}

// Initialize admin capability and dream registry
fun init(ctx: &mut TxContext) {
    let adminCap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(adminCap, ctx.sender());
    
    // Create global dream registry
    let dreamRegistry = DreamRegistry {
        id: object::new(ctx),
        allDreams: vector::empty(),
    };
    transfer::share_object(dreamRegistry);
}

public entry fun addToLegacyWall(wall: &mut LegacyWall, dream: &mut DreamNFT) {
    assert!(dream.isComplete, 0);
    vector::push_back(&mut wall.completedDreams, object::id(dream));
}

public fun getDreamID(dream: &DreamNFT): ID {
    object::id(dream)
}

public fun getDreamOwner(dream: &DreamNFT): address {
    dream.owner
}


public entry fun mintDream(
    registry: &mut DreamRegistry,
    title: string::String, 
    goalAmount: u64, 
    description: string::String, 
    ctx: &mut TxContext
) {
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
    let dream_id = object::id(&dream);
    
    // Add to global registry
    vector::push_back(&mut registry.allDreams, dream_id);
    
    event::emit(DreamCreated {
        dream_id,
        creator: ctx.sender(),
        title,
        goal_amount: goalAmount,
    });
    transfer::transfer(dream, ctx.sender());
}

// Admin function to approve dreams
public entry fun approveDream(_: &AdminCap, dream: &mut DreamNFT, ctx: &mut TxContext) {
    dream.isApproved = true;    
    event::emit(DreamApproved {
        dream_id: object::id(dream),
        approved_by: ctx.sender(),
    });
}

// Admin function to reject dreams
public entry fun rejectDream(_: &AdminCap, dream: &mut DreamNFT, ctx: &mut TxContext) {
    dream.isApproved = false;
    event::emit(DreamRejected {
        dream_id: object::id(dream),
        rejected_by: ctx.sender(),
    });
}

// Only allow pledging to approved dreams and only by the dream owner
public entry fun pledgeToDream(dream: &mut DreamNFT, amount: u64, ctx: &mut TxContext) {
    assert!(dream.isApproved, 1);
    assert!(dream.owner == ctx.sender(), 2); 
    let dream_id = object::id(dream);
    dream.savedAmount = dream.savedAmount + amount;
    if (dream.savedAmount >= dream.goalAmount) {
        dream.isComplete = true;
        event::emit(DreamCompleted {
            dream_id,
            completed_by: ctx.sender(),
        });
    };
    event::emit(PledgeMade {
        dream_id,
        pledger: ctx.sender(),
        amount: amount,
    });
}

public fun isComplete(nft: &DreamNFT): bool {
    nft.isComplete
}

public fun isApproved(nft: &DreamNFT): bool {
    nft.isApproved
}

public fun addMatchAmount(dream: &mut DreamNFT, amount: u64, ctx: &mut TxContext) {
    dream.savedAmount = dream.savedAmount + amount;
    if (dream.savedAmount >= dream.goalAmount) {
        dream.isComplete = true;
        event::emit(DreamCompleted {
            dream_id: object::id(dream),
            completed_by: ctx.sender(),
        });
    };
}

// Admin function to get all dream IDs from the registry
public fun getAllDreamIDs(_: &AdminCap, registry: &DreamRegistry): vector<ID> {
    registry.allDreams
}

// Admin function to get dream details by ID
public fun getDreamDetails(_: &AdminCap, dream: &DreamNFT): (address, string::String, u64, u64, bool, bool, string::String) {
    (
        dream.owner,
        dream.title,
        dream.goalAmount,
        dream.savedAmount,
        dream.isComplete,
        dream.isApproved,
        dream.description
    )
}

// Get all dreams (admin function)
public fun getAllDreams(): vector<ID> {
    // This would need to be implemented differently in a real scenario
    // For now, we'll use a different approach
    vector::empty()
}

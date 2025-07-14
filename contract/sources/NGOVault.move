module final_project::NGOVault;

use final_project::DreamNFT;
use sui::event;

public struct NGOVault has key {
    id: UID,
    ngo: address,
    dreamID: ID,
    matchAmount: u64,
    minAmount: u64,
    contributedAmount: u64,
    isActive: bool,
}

public struct MonthlyContribution has copy, drop {
    dream_id: ID,
    vault_id: ID,
    contributed_by: address,
    amount: u64,
}

public struct MatchReleased has copy, drop {
    dreamID: ID,
    amount: u64,
    matchedBy: address,
}

public entry fun createVault(
    _: &DreamNFT::AdminCap,
    dreamID: ID,
    matchAmount: u64,
    minAmount: u64,
    ctx: &mut TxContext,
) {
    let vault = NGOVault {
        id: object::new(ctx),
        ngo: ctx.sender(),
        dreamID: dreamID,
        matchAmount: matchAmount,
        minAmount: minAmount,
        contributedAmount: 0,
        isActive: true,
    };
    transfer::transfer(vault, ctx.sender());
}

public entry fun recordMonthlyContribution(vault: &mut NGOVault, dream: &mut DreamNFT::DreamNFT, amount: u64) {
    assert!(vault.isActive, 0);
    assert!(DreamNFT::getDreamID(dream) == vault.dreamID, 1);
    
    vault.contributedAmount = vault.contributedAmount + amount;

    event::emit(MonthlyContribution {
        dream_id: object::id(dream),
        vault_id: object::id(vault),
        contributed_by: DreamNFT::getDreamOwner(dream),
        amount: amount,
    });
}

public entry fun releaseMatch(
    _: &DreamNFT::AdminCap,
    vault: &mut NGOVault,
    dream: &mut DreamNFT::DreamNFT,
    ctx: &mut TxContext,
) {
    assert!(vault.isActive, 0);
    assert!(vault.contributedAmount >= vault.minAmount, 1);
    assert!(vault.ngo == ctx.sender(), 2); // Only NGO can release
    assert!(DreamNFT::getDreamID(dream) == vault.dreamID, 3);

    DreamNFT::addMatchAmount(dream, vault.matchAmount, ctx);
    vault.isActive = false;

    event::emit(MatchReleased {
        dreamID: object::id(dream),
        amount: vault.matchAmount,
        matchedBy: vault.ngo,
    });
}

public fun getVaultID(vault: &NGOVault): ID {
    object::id(vault)
}
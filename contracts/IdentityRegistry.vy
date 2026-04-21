# contracts/IdentityRegistry.vy
# ERC-8004 Identity Registry — registers AI agents with on-chain identity

# @version ^0.4.0

# Events
event AgentRegistered:
    agent_id: indexed(uint256)
    agent_address: indexed(address)
    agent_type: String[32]
    metadata_uri: String[256]

event AgentUpdated:
    agent_id: indexed(uint256)
    agent_address: indexed(address)

# Agent identity struct
struct AgentIdentity:
    agent_address: address
    agent_type: String[32]      # "scanner", "optimizer", "executor", "reflexion"
    metadata_uri: String[256]   # IPFS URI or inline JSON descriptor
    reputation_score: uint256   # Updated by ReputationRegistry
    registered_at: uint256
    is_active: bool

# State
owner: public(address)
agent_count: public(uint256)
agents: public(HashMap[uint256, AgentIdentity])
address_to_id: public(HashMap[address, uint256])

@deploy
def __init__():
    self.owner = msg.sender
    self.agent_count = 0

@external
def register_agent(agent_address: address, agent_type: String[32], metadata_uri: String[256]) -> uint256:
    assert msg.sender == self.owner, "Only owner can register agents"
    assert self.address_to_id[agent_address] == 0, "Agent already registered"
    
    self.agent_count += 1
    agent_id: uint256 = self.agent_count
    
    self.agents[agent_id] = AgentIdentity({
        agent_address: agent_address,
        agent_type: agent_type,
        metadata_uri: metadata_uri,
        reputation_score: 0,
        registered_at: block.timestamp,
        is_active: True
    })
    self.address_to_id[agent_address] = agent_id
    
    log AgentRegistered(agent_id, agent_address, agent_type, metadata_uri)
    return agent_id

@external
def update_reputation(agent_id: uint256, new_score: uint256):
    assert msg.sender == self.owner, "Only owner"
    self.agents[agent_id].reputation_score = new_score

@view
@external
def get_agent(agent_id: uint256) -> AgentIdentity:
    return self.agents[agent_id]

@view
@external  
def get_agent_by_address(agent_address: address) -> AgentIdentity:
    agent_id: uint256 = self.address_to_id[agent_address]
    return self.agents[agent_id]

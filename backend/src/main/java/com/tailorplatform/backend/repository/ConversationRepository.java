package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByCustomerIdAndTailorId(Long customerId, Long tailorId);

    /** All conversations where the user is either the customer or the tailor */
    List<Conversation> findByCustomerIdOrTailorIdOrderByLastMessageAtDesc(Long customerId, Long tailorId);
}

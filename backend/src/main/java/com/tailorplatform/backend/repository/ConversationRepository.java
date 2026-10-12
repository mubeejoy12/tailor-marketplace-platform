package com.tailorplatform.backend.repository;

import com.tailorplatform.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByCustomerIdAndTailorId(Long customerId, Long tailorId);

    List<Conversation> findByCustomerIdOrderByLastMessageAtDesc(Long customerId);

    /** All conversations where the user is the customer, or their tailor profile is the tailor */
    List<Conversation> findByCustomerIdOrTailorIdOrderByLastMessageAtDesc(Long customerId, Long tailorId);
}

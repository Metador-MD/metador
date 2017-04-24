<?php

namespace WhereGroup\CoreBundle\Security;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use WhereGroup\CoreBundle\Entity\Metadata;
use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Entity\User;

/**
 * Class MetadataVoter
 * @package WhereGroup\CoreBundle\Security
 */
class MetadataVoter extends Voter
{
    const EDIT = 'edit';
    const VIEW = 'view';

    private $decisionManager;

    /**
     * MetadataVoter constructor.
     * @param AccessDecisionManagerInterface $decisionManager
     */
    public function __construct(AccessDecisionManagerInterface $decisionManager)
    {
        $this->decisionManager = $decisionManager;
    }

    /**
     * @param string $attribute
     * @param mixed $subject
     * @return bool
     */
    protected function supports($attribute, $subject)
    {
        if (!in_array($attribute, array(self::EDIT, self::VIEW))) {
            return false;
        }

        // only vote on Metadata objects inside this voter
        if (!$subject instanceof Metadata) {
            return false;
        }
        return true;
    }

    /**
     * @param string $attribute
     * @param Metadata $subject
     * @param TokenInterface $token
     * @return bool
     */
    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $user = $token->getUser();

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($subject, $user, $token);
            case self::EDIT:
                return $this->canEdit($subject, $user, $token);
        }

        throw new \LogicException('This code should not be reached!');
    }

    /**
     * @param Metadata $entity
     * @param User $user
     * @param $token
     * @return bool
     */
    private function canView(Metadata $entity, $user, $token)
    {
        // is public
        if ($entity->getPublic() === true || $this->canEdit($entity, $user, $token)) {
            return true;
        }

        return false;
    }

    /**
     * @param Metadata $entity
     * @param User $user
     * @param $token
     * @return bool
     */
    private function canEdit(Metadata $entity, $user, $token)
    {
        if (!$user instanceof User) {
            return false;
        }

        if ($entity->getLocked()) {
            $lastUser = $entity->getUpdateUser();
            $dateTime = new \DateTime();
            $timeout = ($dateTime->getTimestamp() - $entity->getUpdateTime()) > (int)ini_get("session.gc_maxlifetime");

            if (!$timeout && $lastUser->getId() !== $user->getId()) {
                return false;
            }
        }

        // can edit if user is owner
        if ($entity->getInsertUser()->getId() === $user->getId()) {
            return true;
        }

        // can edit if user has the role geo office
        if ($this->decisionManager->decide($token, array('ROLE_SYSTEM_GEO_OFFICE'))) {
            return true;
        }

        // can edit if user is in the same group
        /** @var Group $group */
        foreach ($entity->getGroups() as $group) {
            if ($this->isSystemGroup($group->getRole())) {
                continue;
            }

            /** @var Group $userGroup */
            foreach ($user->getGroups() as $userGroup) {
                if ($this->isSystemGroup($userGroup->getRole())) {
                    continue;
                }

                if ($group->getRole() === $userGroup->getRole()) {
                    return true;
                }
            }
        }

        dump("test");

        return false;
    }

    /**
     * @param $groupname
     * @return bool
     */
    private function isSystemGroup($groupname)
    {
        return (substr($groupname, 0, 12) === 'ROLE_SYSTEM_');
    }
}

<?php

namespace WhereGroup\CoreBundle\Security;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use WhereGroup\CoreBundle\Component\Exceptions\MetadorException;
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
    const EDIT_GROUP = 'edit_group';

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
        if (!in_array($attribute, [self::EDIT, self::VIEW, self::EDIT_GROUP])) {
            return false;
        }

        // only vote on Metadata array inside this voter
        if (!is_array($subject) || !isset($subject['_profile']) || !isset($subject['_source'])) {
            return false;
        }

        return true;
    }

    /**
     * @param string $attribute
     * @param array $subject
     * @param TokenInterface $token
     * @return bool
     * @throws MetadorException
     */
    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $user = $token->getUser();

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($subject, $user, $token);
            case self::EDIT:
                return $this->canEdit($subject, $user, $token);
            case self::EDIT_GROUP:
                return $this->canEditGroup($subject, $user, $token);
        }

        throw new \LogicException('This code should not be reached!');
    }

    /**
     * @param $subject
     * @param $user
     * @param $token
     * @return bool
     * @throws MetadorException
     */
    private function canView($subject, $user, $token)
    {
        // Is public
        if ((boolean)$subject['_public'] === true || $this->canEdit($subject, $user, $token)) {
            return true;
        }

        // Same group?
        if ($user instanceof User && isset($subject['_groups'])) {
            foreach ($user->getRoles() as $role) {
                if (in_array($role, $subject['_groups'])) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param $subject
     * @param $user
     * @param $token
     * @return bool
     * @throws MetadorException
     */
    private function canEdit($subject, $user, $token)
    {
        if (!$user instanceof User) {
            return false;
        }

        if (isset($subject['_locked']) && $subject['_locked']) {
            if (!isset($subject['_lock_user']) || !isset($subject['_lock_time'])) {
                throw new MetadorException('_lock_user and _lock_time are missing in Dataobject!');
            }

            $dateTime = new \DateTime();
            $timeout = ($dateTime->getTimestamp() - $subject['_lock_time']) > (int)ini_get("session.gc_maxlifetime");

            if (!$timeout && $subject['_lock_user'] !== $user->getUsername()) {
                return false;
            }
        }

        if (!isset($subject['_insert_user'])) {
            throw new MetadorException('_insert_user is missing in Dataobject!');
        }

        // can edit if user is owner
        if ($subject['_insert_user'] === $user->getUsername()) {
            return true;
        }

        // can edit if user has the role geo office
        if ($this->decisionManager->decide($token, ['ROLE_SYSTEM_GEO_OFFICE'])) {
            return true;
        }

        if (!isset($subject['_groups']) || !is_array($subject['_groups'])) {
            $subject['_groups'] = [];
        }

        // can edit if user is in the same group
        /** @var Group $group */
        foreach ($subject['_groups'] as $group) {
            if ($this->isSystemGroup($group)) {
                continue;
            }

            /** @var Group $userGroup */
            foreach ($user->getGroups() as $userGroup) {
                if ($this->isSystemGroup($userGroup->getRole())) {
                    continue;
                }

                if ($group === $userGroup->getRole()) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param $subject
     * @param $user
     * @param $token
     * @return bool
     */
    private function canEditGroup($subject, $user, $token)
    {
        if (!$user instanceof User) {
            return false;
        }

        if (isset($subject['_insert_user']) && $subject['_insert_user'] == $user->getUsername()) {
            return true;
        }

        if (!isset($subject['_insert_user']) && !isset($subject['_uuid'])) {
            return true;
        }

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

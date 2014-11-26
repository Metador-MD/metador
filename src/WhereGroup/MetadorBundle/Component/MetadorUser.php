<?php

namespace WhereGroup\MetadorBundle\Component;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class MetadorUser
 * @package WhereGroup\MetadorBundle\Component
 * @author A. R. Pour
 */
class MetadorUser implements MetadorUserInterface
{
    protected $container;

    /**
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function getUser()
    {
        return $this->container->get('security.context')->getToken()->getUser();
    }

    /**
     * @param $username
     * @return mixed
     */
    public function getUserByUsername($username)
    {
        return $this->container
            ->get('doctrine.orm.entity_manager')
            ->getRepository('WhereGroupUserBundle:User')
            ->findOneByUsername($username);
    }

    /**
     * @param $metadata
     * @param null $user
     * @param null $ignoreRole
     * @return bool
     */
    public function checkMetadataAccess($metadata, $user = null, $ignoreRole = null)
    {
        if (is_null($user)) {
            $user = $this->getUser();
        }

        if (!is_object($user)) {
            return false;
        }

        // OWNER HAS ACCESS
        if ($metadata->getInsertUser()->getId() === $user->getId()) {
            return true;
        }

        if (is_null($ignoreRole)) {
            $ignoreRole = array(
                'ROLE_USER',
                'ROLE_SUPERUSER',
                'ROLE_ADMIN',
                'ROLE_METADOR_ADMIN');
        }

        foreach ($user->getRoles() as $userRole) {
            foreach ($metadata->getGroups() as $group) {
                if ($userRole === $group && !in_array($group, $ignoreRole)) {
                    return true;
                }
            }
        }

        return false;
    }
}

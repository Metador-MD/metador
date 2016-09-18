<?php

namespace WhereGroup\CoreBundle\Command;

use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Entity\Group;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

class ResetSuperuserCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Create new password for root user')
            ->setName('metador:reset:superuser');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $rootUser  = 'root';
        $rootGroup = 'ROLE_SYSTEM_SUPERUSER';
        $password  = $this->generatePassword();

        $user = $this->getUser($rootUser);

        if (!$user) {
            $user = new User();
            $user->setUsername($rootUser);
        }

        $user->setPassword($this->encodePassword($user, $password));

        $isSuperuser = false;
        foreach ($user->getGroups() as $group) {
            if ($group->getRole() === $rootGroup) {
                $isSuperuser = true;
            }
        }

        if (!$isSuperuser) {
            $user->addGroup($this->getGroup($rootGroup));
        }

        $this->save($user);

        $output->writeln('User     : <info>' . $rootUser . '</info>');
        $output->writeln('Password : <info>' . $password . '</info>');
    }

    /**
     * @param $user
     * @param $password
     * @return string
     */
    protected function encodePassword($user, $password)
    {
        return $this
            ->getContainer()
            ->get('security.encoder_factory')
            ->getEncoder($user)
            ->encodePassword($password, $user->getSalt());
    }

    /**
     * @param $string
     * @param array $params
     * @return string
     */
    protected function trans($string, $params = array())
    {
        return @$this
            ->getContainer()
            ->get('translator')
            ->trans($string, $params);
    }

    /**
     * @param $entity
     */
    protected function save($entity)
    {
        $this->getContainer()->get('doctrine')->getManager()->persist($entity);
        $this->getContainer()->get('doctrine')->getManager()->flush();
    }

    /**
     * @param $name
     * @return mixed
     */
    protected function getUser($name)
    {
        return $this
            ->getContainer()
            ->get('doctrine')
            ->getRepository('MetadorUserBundle:User')
            ->findOneByUsername($name);
    }

    /**
     * @param $name
     * @return mixed
     */
    protected function getGroup($name)
    {
        return $this
            ->getContainer()
            ->get('doctrine')
            ->getRepository('MetadorUserBundle:Group')
            ->findOneByRole($name);
    }

    /**
     * @param int $length
     * @return string
     */
    protected function generatePassword($length = 10)
    {
        $password = "";
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        srand((double)microtime()*1000000);

        for ($i = 0; $i < $length; $i++) {
            $password .= substr($chars, rand() % strlen($chars), 1);
        }

        return $password;
    }
}

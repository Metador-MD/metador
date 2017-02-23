<?php

namespace WhereGroup\CoreBundle\Command;

use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Entity\Group;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

/**
 * Class ResetSuperuserCommand
 * @package WhereGroup\CoreBundle\Command
 */
class ResetSuperuserCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Create new password for root user')
            ->setName('metador:reset:superuser');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $rootUser  = 'root';
        $rootGroup = 'ROLE_SYSTEM_SUPERUSER';
        $password  = $this->getContainer()->get('metador_user')->generatePassword();

        $user = $this->getContainer()->get('metador_user')->getByUsername($rootUser);

        if (!$user) {
            $user = new User();
            $user->setUsername($rootUser);
        }

        $user->setPassword($this->getContainer()->get('metador_user')->encodePassword($user, $password));


        $isSuperuser = false;
        foreach ($user->getGroups() as $group) {
            if ($group->getRole() === $rootGroup) {
                $isSuperuser = true;
            }
        }

        if (!$isSuperuser) {
            $user->addGroup($this->getContainer()->get('metador_user')->getGroupByName($rootGroup));
        }

        $this->getContainer()->get('doctrine')->getManager()->persist($user);
        $this->getContainer()->get('doctrine')->getManager()->flush();

        $output->writeln('User     : <info>' . $rootUser . '</info>');
        $output->writeln('Password : <info>' . $password . '</info>');
    }
}

<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputOption;
use WhereGroup\UserBundle\Entity\User;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
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
            ->setName('metador:reset:superuser')
            ->setDefinition([
                new InputOption('password', 'p', InputOption::VALUE_OPTIONAL, 'Default password'),
            ])
        ;
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
        $password  = $input->getOption('password');

        if (is_null($password)) {
            $password  = $this->getContainer()->get('metador_user')->generatePassword();
        }

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

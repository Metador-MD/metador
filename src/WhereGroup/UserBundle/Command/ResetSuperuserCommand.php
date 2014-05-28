<?php

namespace WhereGroup\UserBundle\Command;

use WhereGroup\UserBundle\Entity\User;
use WhereGroup\UserBundle\Entity\Group;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

class ResetSuperuserCommand extends ContainerAwareCommand {
    protected function configure() {
        $this->setDefinition(array(
            new InputOption('username', '', InputOption::VALUE_REQUIRED, "Username"),
            new InputOption('password', '', InputOption::VALUE_REQUIRED, "Password")))
        ->setDescription('Create superuser account.')
        ->setHelp('Create superuser account.')
        ->setName('metador:reset:superuser');
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $doctrine = $this->getContainer()->get('doctrine');
        $encoder = $this->getContainer()->get('security.encoder_factory');

        $username = $input->getOption('username');
        $username = is_null($username) ? 'root' : $username;

        $password = $input->getOption('password');
        $password = is_null($password) ? 'root' : $password;

        $user = $doctrine->getRepository('WhereGroupUserBundle:User')->find(1);

        if($user) {
            $output->writeln('Benutzer ' . $user->getUsername() . ' schon vorhanden. Nur Kennwort geändert.');

            $user->setPassword(
                $encoder->getEncoder($user)->encodePassword(
                    trim($password), $user->getSalt()
                )
            );
        } else {
            $user = new User();
            $user->setUsername(trim($username));
            $user->setPassword(
                $encoder->getEncoder($user)->encodePassword(
                    trim($password), $user->getSalt()
                )
            );

            $group = $doctrine->getRepository('WhereGroupUserBundle:Group')->findOneByRole('ROLE_SUPERUSER');

            if(!$group) {
                $group = new Group();
                $group->setRole("ROLE_SUPERUSER");
                $em = $doctrine->getManager();
                $em->persist($group);
                $em->flush();
                unset($em);
            }

            $user->addGroup($group);
            $output->writeln('Benutzer ' . $username . ' eingetragen.');
        }

        if(is_object($user)) {
            $em = $doctrine->getManager();
            $em->persist($user);
            $em->flush();
        }
    }
}
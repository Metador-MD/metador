<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Style\SymfonyStyle;
use WhereGroup\CoreBundle\Component\Utils\Password;
use WhereGroup\UserBundle\Entity\Group;
use WhereGroup\UserBundle\Entity\User;
use Symfony\Component\Yaml\Yaml;

/**
 * Class InitDatabaseCommand
 * @package WhereGroup\CoreBundle\Command
 */
class InitDatabaseCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Create system groups and user')
            ->setName('metador:init:database');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        // Create system groups
        $groups = [
            'ROLE_SYSTEM_SUPERUSER',
            'ROLE_SYSTEM_GEO_OFFICE',
            'ROLE_SYSTEM_GUEST'
        ];

        foreach ($groups as $name) {
            if (!$this->getGroup($name)) {
                $group = new Group();
                $group->setRole($name);
                $this->save($group);
                $output->writeln($this->trans('command_init_db_add_group', ['%group%' => $name]));
            }
        }

        $rootUser  = 'root';
        $rootGroup = 'ROLE_SYSTEM_SUPERUSER';

        // Create superuser
        if ($this->getUser($rootUser)) {
            $output->writeln($this->trans('command_init_db_user_exists', ['%user%' => $rootUser]));
        } else {
            $password = Password::generate();
            $user = new User();
            $user->setUsername($rootUser);
            $user->setPassword($this->encodePassword($user, $password));
            $user->addGroup($this->getGroup($rootGroup));
            $this->save($user);

            $output->writeln($this->trans('command_init_db_add_user', [
                '%user%'     => $rootUser,
                '%password%' => $password,
            ]));

            $output->writeln($this->trans('command_init_db_add_group_to_user', [
                '%user%'  => $rootUser,
                '%group%' => $rootGroup
            ]));

            $output->writeln('User     : <info>' . $rootUser . '</info>');
            $output->writeln('Password : <info>' . $password . '</info>');
        }

        $this->addSettingsToDatabase();
        $this->addSourceAndProfilesToDatabase();
    }

    private function addSourceAndProfilesToDatabase()
    {
        $sourceService = $this->getContainer()->get('metador_source');

        if ($sourceService->count() === 0) {
            $sourceService->set('default', 'Metadaten');
        }
    }

    private function addSettingsToDatabase()
    {
        // Add default configuration to database
        $plugins = Yaml::parse(file_get_contents(__DIR__ . '/../Resources/config/plugin.yml'));

        foreach ($plugins as $pluginKey => $pluginInfo) {
            if (!isset($pluginInfo['settings'])) {
                continue;
            }

            foreach ($pluginInfo['settings'] as $settingKey => $setting) {
                if (!isset($setting['default'])) {
                    continue;
                }

                $this->getContainer()
                    ->get('metador_configuration')
                    ->set($settingKey, $setting['default'], 'plugin', $pluginKey);
            }
        }
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
    protected function trans($string, $params = [])
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
            ->findByUsername($name);
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
}

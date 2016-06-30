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

/**
 * Class HealthCheckCommand
 * @package WhereGroup\CoreBundle\Command
 */
class HealthCheckCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setDescription('Determine the health of the application')
            ->setName('metador:health-check');
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io         = new SymfonyStyle($input, $output);
        $translator = $this->getContainer()->get('translator');
        $log        = $this->getContainer()->get('metador_healthcheck')->check();

        $io->title($translator->trans('healthcheck_title'));

        if (isset($log['warning']) && count($log['warning']) > 0) {
            $io->warning($translator->trans("healthcheck_error_message"));

            $table = new Table($output);
            $table
                ->setHeaders(array(
                    $translator->trans('healthcheck_table_origin'),
                    $translator->trans('healthcheck_table_message')
                ))
                ->setRows($log['warning'])
            ;
            $table->render();

            return;
        }

        $io->success($translator->trans("healthcheck_success_message"));
    }
}

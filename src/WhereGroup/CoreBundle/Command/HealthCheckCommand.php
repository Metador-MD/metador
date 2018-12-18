<?php

namespace WhereGroup\CoreBundle\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
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
     * @throws \Exception
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io         = new SymfonyStyle($input, $output);
        $translator = $this->getContainer()->get('translator');
        $event      = $this->getContainer()->get('metador_healthcheck')->check();

        $io->title($translator->trans('healthcheck_title'));

        if ($event->hasError()) {
            if ($input->getOption('quiet')) {
                throw new \Exception($translator->trans("healthcheck_error_message"));
            }
            $io->warning($translator->trans("healthcheck_error_message"));
        } else {
            $io->success($translator->trans("healthcheck_success_message"));
        }

        if (!empty($event->getLogs())) {
            $rows = [];

            foreach ($event->getLogs() as $log) {
                if ($input->getOption('verbose') === false && $log->getResult() !== 'error') {
                    continue;
                }

                $rows[] = [strtoupper($log->getResult()), $log->getOrigin(), $log->getMessage()];
            }

            if (!empty($rows)) {
                $table = new Table($output);
                $table
                    ->setHeaders([
                        '#',
                        $translator->trans('healthcheck_table_origin'),
                        $translator->trans('healthcheck_table_message')
                    ])
                    ->setRows($rows)
                ;
                $table->render();
            }
        }
    }
}

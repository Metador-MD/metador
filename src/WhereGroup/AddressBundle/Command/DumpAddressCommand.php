<?php

namespace WhereGroup\AddressBundle\Command;

use Doctrine\ORM\QueryBuilder;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Console\Question\ConfirmationQuestion;

/**
 * Class DumpAddressCommand
 * @package WhereGroup\AddressBundle\Command
 */
class DumpAddressCommand extends ContainerAwareCommand
{
    const MAX_RESULTS = 100;

    protected function configure()
    {
        $this
            ->setDescription('Dumps addresses to filesystem')
            ->setName('metador:dump:address')
            ->addArgument('file', InputArgument::REQUIRED, 'File to dump in?')
            ->addOption('pretty', null, InputOption::VALUE_NONE, 'Pretty print address')
        ;
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $fs = new Filesystem();
        $io = new SymfonyStyle($input, $output);
        $helper = $this->getHelper('question');

        $io->title('Dump Addresses');

        $file   = $input->getArgument('file');
        $pretty = (boolean)$input->getOption('pretty');

        // File exists
        if ($fs->exists($file)) {
            $question = new ConfirmationQuestion('Override File?', false, '/^(y|j)/i');

            if (!$helper->ask($input, $output, $question)) {
                return;
            }

            $fs->remove($file);
        }

        $em = $this->getContainer()->get('doctrine')->getManager();

        /** @var QueryBuilder $qb */
        $qb = $em->getRepository('MetadorAddressBundle:Address')
            ->createQueryBuilder('a')
            ->select('a');

        $firstResult = 0;
        $count = 0;

        $fs->touch($file);

        // Dump all documents
        file_put_contents($file, '[');

        do {
            $rows = $qb
                ->setMaxResults(self::MAX_RESULTS)
                ->setFirstResult($firstResult)
                ->getQuery()
                ->getArrayResult();

            foreach ($rows as $row) {
                if (isset($row['id'])) {
                    unset($row['id']);
                }

                if (isset($row['uuid'])) {
                    unset($row['uuid']);
                }

                $json = $pretty ? json_encode($row, JSON_PRETTY_PRINT) : json_encode($row);

                file_put_contents($file, $count != 0 ? ',' . $json : $json, FILE_APPEND);

                ++$count;
            }

            $firstResult = $firstResult + self::MAX_RESULTS;
        } while (!empty($rows));

        file_put_contents($file, ']', FILE_APPEND);

        $io->success($count . " addresses dumped.");
    }
}
